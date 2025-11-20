import { ethers } from "ethers";

/**
 * Blockchain utility functions for contract interactions using ethers.js
 */

interface SimulateWriteOptions {
  provider: ethers.providers.Provider;
  signer: ethers.Signer;
  contractAddress: string;
  abi: any[];
  functionName: string;
  args?: any[];
  value?: bigint;
}

interface SimulateWriteResult {
  txHash?: string;
  error?: {
    name?: string;
    args?: any[];
    raw?: string;
  };
}

/**
 * Simulate and write contract with error decoding
 */
export async function simulateAndWriteContract(
  options: SimulateWriteOptions
): Promise<SimulateWriteResult> {
  const { provider, signer, contractAddress, abi, functionName, args = [], value } = options;

  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Step 1: Estimate gas (simulation)
    let tx: ethers.providers.TransactionResponse;
    try {
      if (value && value > 0n) {
        tx = await contract[functionName](...args, { value });
      } else {
        tx = await contract[functionName](...args);
      }
    } catch (estimateError: any) {
      // Try to decode error
      const errorData = estimateError.data || estimateError.error?.data;
      if (errorData) {
        const iface = new ethers.utils.Interface(abi);
        try {
          const decoded = iface.parseError(errorData);
          return {
            error: {
              name: decoded.name,
              args: decoded.args,
              raw: String(estimateError),
            },
          };
        } catch (decodeErr) {
          // Decode failed
        }
      }
      return {
        error: {
          name: estimateError.reason || estimateError.error?.reason,
          raw: String(estimateError),
        },
      };
    }

    // Step 2: Wait for transaction (optional, can be async)
    return { txHash: tx.hash };
  } catch (err: any) {
    // Try to decode the error
    const errorData = err.data || err.error?.data;
    let decoded = null;

    if (errorData) {
      try {
        const iface = new ethers.utils.Interface(abi);
        decoded = iface.parseError(errorData);
      } catch (decodeErr) {
        // Decode failed
      }
    }

    return {
      error: {
        name: decoded?.name || err.reason || err.error?.reason,
        args: decoded?.args,
        raw: String(err),
      },
    };
  }
}

/**
 * Create provider for base-sepolia
 */
export function createBaseSepoliaPublicClient(
  rpcUrl?: string
): ethers.providers.JsonRpcProvider {
  return new ethers.providers.JsonRpcProvider(
    rpcUrl || process.env.BASE_RPC_URL || process.env.RPC_URL || "https://sepolia.base.org"
  );
}

/**
 * Create wallet from private key
 */
export function createWalletClientFromPrivateKey(
  privateKey: string,
  rpcUrl?: string
): ethers.Wallet {
  const provider = createBaseSepoliaPublicClient(rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  provider: ethers.providers.Provider,
  txHash: string,
  confirmations: number = 1
): Promise<void> {
  await provider.waitForTransaction(txHash, confirmations);
}
