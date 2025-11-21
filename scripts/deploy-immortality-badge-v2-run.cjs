/**
 * Deploy ImmortalityBadgeV2 contract
 * Run with: npm run deploy:immortality-v2
 * Or: node scripts/deploy-immortality-badge-v2-run.cjs
 */

const path = require("path");
const envPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: envPath, override: true });
const { ethers } = require("ethers");
const { persistContract } = require("./utils/persist-contract.cjs");

async function main() {
  const pk = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing PRIVATE_KEY or DEPLOYER_PRIVATE_KEY in environment variables");
  }

  const network = process.env.NETWORK || "base-sepolia";
  const rpcUrl = 
    (network === "base-sepolia" && process.env.BASE_SEPOLIA_RPC_URL) ||
    (network === "base" && process.env.BASE_RPC_URL) ||
    process.env.BASE_SEPOLIA_RPC_URL || 
    process.env.BASE_RPC_URL || 
    "https://sepolia.base.org";
  
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk, provider);

  // Check wallet balance
  const balance = await provider.getBalance(wallet.address);
  console.log(`Deployer address: ${wallet.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  if (balance.lt(ethers.utils.parseEther("0.001"))) {
    console.warn("⚠️  Warning: Low balance! You may need more ETH for deployment.");
  }

  // Constructor parameters
  const baseUri = process.env.IMMORTALITY_BADGE_BASE_URI || process.env.IMMORTALITY_BADGE_URI || "";
  const admin = process.env.IMMORTALITY_BADGE_ADMIN || wallet.address;
  const mintPrice = process.env.IMMORTALITY_BADGE_MINT_PRICE || "0"; // Default: free minting

  console.log("\n=== ImmortalityBadgeV2 Deployment Configuration ===");
  console.log(`Network: ${network}`);
  console.log(`RPC URL: ${rpcUrl}`);
  console.log(`Base URI: ${baseUri || "(empty - using default)"}`);
  console.log(`Admin: ${admin}`);
  console.log(`Mint Price: ${ethers.utils.formatEther(mintPrice)} ETH`);
  console.log("");

  // Load contract artifact
  const fs = require("fs");
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ImmortalityBadgeV2.sol/ImmortalityBadgeV2.json");
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Contract artifact not found at ${artifactPath}\nPlease run 'npm run compile' first.`);
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  console.log("✅ Contract artifact loaded");

  // Deploy contract
  console.log("\n=== Deploying Contract ===");
  const Badge = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  
  const mintPriceWei = ethers.utils.parseEther(mintPrice);
  const badge = await Badge.deploy(baseUri, admin, mintPriceWei);
  
  console.log(`📝 Deployment transaction: ${badge.deployTransaction.hash}`);
  console.log(`⏳ Waiting for deployment confirmation...`);
  
  // Wait for deployment
  const deployReceipt = await badge.deployTransaction.wait();
  console.log(`✓ Deployment confirmed in block ${deployReceipt.blockNumber}`);
  console.log(`📊 Gas used: ${deployReceipt.gasUsed.toString()}`);
  
  // Ensure contract is fully deployed
  await badge.deployed();
  console.log(`✅ ImmortalityBadgeV2 deployed to ${badge.address}`);

  // Verify contract code exists (with retry mechanism)
  let code = await provider.getCode(badge.address);
  let retries = 0;
  const maxRetries = 5;

  while ((!code || code === "0x" || code === "0X") && retries < maxRetries) {
    retries++;
    console.log(`Waiting for contract code... (retry ${retries}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    code = await provider.getCode(badge.address);
  }

  const codeSize = code.length / 2 - 1;
  console.log(`📦 Contract code size: ${codeSize} bytes`);
  
  if (!code || code === "0x" || code === "0X") {
    throw new Error(
      `No contract code at ${badge.address} after ${maxRetries} retries.\n` +
      `Deployment may have failed. Transaction: ${badge.deployTransaction.hash}`
    );
  }

  // Get network info
  const networkInfo = await provider.getNetwork();
  const chainId = networkInfo.chainId;

  // Verify deployment by calling a view function
  let paused = false;
  try {
    const name = await badge.name();
    const symbol = await badge.symbol();
    const contractMintPrice = await badge.mintPrice();
    paused = await badge.paused();
    
    console.log("\n=== Contract Verification ===");
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Mint Price: ${ethers.utils.formatEther(contractMintPrice)} ETH`);
    console.log(`Paused: ${paused}`);
    console.log("✅ Contract verification successful");
  } catch (err) {
    console.warn("⚠️  Could not verify contract state:", err.message);
    // Try to get paused status separately
    try {
      paused = await badge.paused();
    } catch {
      // Ignore if we can't get paused status
    }
  }

  // Post-deployment configuration
  console.log("\n=== Post-Deployment Configuration ===");
  
  try {
    // Configure badge type 1 (BADGE_TYPE_TEST)
    const badgeUri = process.env.IMMORTALITY_BADGE_TYPE_URI || baseUri || "";
    const transferable = process.env.IMMORTALITY_BADGE_TRANSFERABLE !== "false"; // Default: transferable
    
    console.log("Configuring badge type 1...");
    const configureTx = await badge.configureBadgeType(1, {
      enabled: true,
      transferable: transferable,
      uri: badgeUri,
    });
    await configureTx.wait();
    console.log(`✅ Badge type 1 configured (enabled: true, transferable: ${transferable})`);

    // Unpause if needed
    if (paused) {
      console.log("Unpausing contract...");
      const unpauseTx = await badge.unpause();
      await unpauseTx.wait();
      console.log("✅ Contract unpaused");
    } else {
      console.log("✅ Contract is already unpaused");
    }
  } catch (err) {
    console.warn("⚠️  Post-deployment configuration failed:", err.message);
    console.warn("You may need to configure the contract manually:");
    console.warn(`  badge.configureBadgeType(1, {enabled: true, transferable: true, uri: ""})`);
    console.warn(`  badge.unpause()`);
  }

  // Persist contract address
  persistContract(
    "ImmortalityBadgeV2",
    badge.address,
    chainId,
    network,
    {
      metadata: {
        baseUri,
        admin,
        mintPrice: ethers.utils.formatEther(mintPriceWei),
        deploymentTx: badge.deployTransaction.hash,
        blockNumber: deployReceipt.blockNumber,
      },
    }
  );

  // Output deployment summary
  console.log("\n==========================================");
  console.log("✅ Deployment Complete!");
  console.log("==========================================");
  console.log(`Contract Address: ${badge.address}`);
  console.log(`Network: ${network} (Chain ID: ${chainId})`);
  console.log(`Transaction: ${badge.deployTransaction.hash}`);
  console.log(`Block: ${deployReceipt.blockNumber}`);
  console.log("");
  console.log("📝 Next Steps:");
  console.log(`1. Add to .env file:`);
  console.log(`   IMMORTALITY_BADGE_ADDRESS=${badge.address}`);
  console.log(`   VITE_IMMORTALITY_BADGE_ADDRESS=${badge.address}`);
  console.log("");
  console.log(`2. View on block explorer:`);
  if (chainId === 84532n) {
    console.log(`   https://sepolia.basescan.org/address/${badge.address}`);
  } else if (chainId === 8453n) {
    console.log(`   https://basescan.org/address/${badge.address}`);
  }
  console.log("");
  console.log(`3. Verify contract state:`);
  console.log(`   npm run test`);
  console.log("");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed!");
  console.error(error);
  if (error.reason) {
    console.error(`Reason: ${error.reason}`);
  }
  if (error.transaction) {
    console.error(`Transaction: ${error.transaction.hash}`);
  }
  process.exitCode = 1;
});

