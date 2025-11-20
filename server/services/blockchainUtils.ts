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
 * Decode contract error from various error formats
 */
function decodeContractError(error: any, abi: any[]): { name?: string; args?: any[]; raw: string } | null {
  const iface = new ethers.utils.Interface(abi);
  
  // 🔧 改进：尝试从多个嵌套层级提取错误数据
  const errorData = 
    error?.data || 
    error?.error?.data || 
    error?.error?.error?.data ||
    error?.info?.error?.data ||
    error?.cause?.data ||
    error?.cause?.error?.data ||
    error?.transaction?.data ||
    error?.receipt?.data;

  // 🔧 改进：尝试从错误消息中提取 revert 数据
  let revertData = errorData;
  if (!revertData || typeof revertData !== 'string' || !revertData.startsWith('0x')) {
    const errorMessage = String(error?.message || error?.reason || error || '');
    // 尝试匹配 "execution reverted: 0x..." 或 "0x..." 模式
    const hexMatch = errorMessage.match(/0x[a-fA-F0-9]{8,}/i);
    if (hexMatch) {
      revertData = hexMatch[0];
    }
  }

  if (revertData && typeof revertData === 'string' && revertData.startsWith('0x')) {
    try {
      // Try to parse as custom error (ethers v5 approach)
      const selector = revertData.slice(0, 10); // 0x + 4 bytes
      
      // Try to find matching error in ABI
      const errorAbi = abi.filter(item => item.type === 'error');
      for (const errorDef of errorAbi) {
        try {
          const errorSig = iface.getSighash(errorDef.name);
          if (errorSig === selector) {
            try {
              const decoded = iface.decodeErrorResult(errorDef, revertData);
              return {
                name: errorDef.name,
                args: decoded,
                raw: String(error),
              };
            } catch {
              return {
                name: errorDef.name,
                raw: String(error),
              };
            }
          }
        } catch {
          continue;
        }
      }
    } catch (parseErr) {
      // Not a custom error, try to extract reason
    }
  }

  // Fallback: extract reason from error message
  const reason = error?.reason || error?.error?.reason || error?.message;
  if (reason && reason !== 'execution reverted') {
    // 🔧 改进：尝试从 "execution reverted: ErrorName(...)" 中提取错误名
    if (reason.includes('execution reverted')) {
      const revertMatch = reason.match(/execution reverted:\s*(\w+)(?:\(([^)]*)\))?/);
      if (revertMatch) {
        return {
          name: revertMatch[1],
          args: revertMatch[2] ? [revertMatch[2]] : undefined,
          raw: String(error),
        };
      }
    }
    return {
      name: reason,
      raw: String(error),
    };
  }

  return null;
}

/**
 * Simulate and write contract with error decoding
 * Implements: callStatic (preview) + estimateGas + writeContract with full error decoding
 */
export async function simulateAndWriteContract(
  options: SimulateWriteOptions
): Promise<SimulateWriteResult> {
  const { provider, signer, contractAddress, abi, functionName, args = [], value } = options;

  try {
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Step 1: Preview using callStatic (simulation without state change)
    try {
      if (value && value > 0n) {
        await contract.callStatic[functionName](...args, { value });
      } else {
        await contract.callStatic[functionName](...args);
      }
    } catch (previewError: any) {
      const decoded = decodeContractError(previewError, abi);
      if (decoded) {
        return {
          error: {
            name: decoded.name,
            args: decoded.args,
            raw: decoded.raw,
          },
        };
      }
      // If decode failed, continue to estimateGas for more info
    }

    // Step 2: Estimate gas (additional validation)
    try {
      if (value && value > 0n) {
        await contract.estimateGas[functionName](...args, { value });
      } else {
        await contract.estimateGas[functionName](...args);
      }
    } catch (estimateError: any) {
      const decoded = decodeContractError(estimateError, abi);
      if (decoded) {
        return {
          error: {
            name: decoded.name,
            args: decoded.args,
            raw: decoded.raw,
          },
        };
      }
      // �� 修复：即使解码失败，也返回错误信息
      // "cannot estimate gas" 通常意味着交易会失败
      const errorMessage = estimateError?.message || estimateError?.reason || String(estimateError);
      if (errorMessage.includes('cannot estimate gas') || errorMessage.includes('execution reverted')) {
        // 尝试从嵌套错误中提取原始 revert 原因
        const nestedError = estimateError?.error || estimateError?.cause || estimateError?.transaction;
        const nestedDecoded = nestedError ? decodeContractError(nestedError, abi) : null;
        
        return {
          error: {
            name: nestedDecoded?.name || 'ESTIMATE_GAS_FAILED',
            args: nestedDecoded?.args,
            raw: nestedDecoded?.raw || errorMessage,
            // 添加原始错误信息以便调试
            originalError: errorMessage,
          },
        };
      }
      // 其他错误也返回，不要继续执行
      return {
        error: {
          name: 'ESTIMATE_GAS_FAILED',
          raw: errorMessage,
        },
      };
    }

    // Step 3: Execute the transaction
    let tx: ethers.providers.TransactionResponse;
    try {
      if (value && value > 0n) {
        tx = await contract[functionName](...args, { value });
      } else {
        tx = await contract[functionName](...args);
      }
    } catch (writeError: any) {
      const decoded = decodeContractError(writeError, abi);
      if (decoded) {
        return {
          error: {
            name: decoded.name,
            args: decoded.args,
            raw: decoded.raw,
          },
        };
      }
      // Fallback if all decoding fails
      return {
        error: {
          name: writeError.reason || "Execution reverted",
          raw: String(writeError),
        },
      };
    }

    // Step 4: Return transaction hash
    return { txHash: tx.hash };
  } catch (err: any) {
    // Final catch-all: try to decode any remaining error
    const decoded = decodeContractError(err, abi);
    if (decoded) {
      return {
        error: {
          name: decoded.name,
          args: decoded.args,
          raw: decoded.raw,
        },
      };
    }

    return {
      error: {
        name: err.reason || err.error?.reason || "Unknown error",
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
