import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address, Hex } from 'viem';
import type { MintBatchResult } from '../types';
import ERC721CreatorABI from '../../abis/ERC721Creator.json';

/**
 * Configuration for batch minting NFTs
 */
export interface BatchMintConfig {
  contractAddress: Address;
  to: Address;
  count?: number;
  uris?: string[];
}

/**
 * Status of the batch minting process
 */
export type BatchMintStatus = 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';

/**
 * Error details for batch minting failures
 */
export interface BatchMintError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Progress information for batch minting
 */
export interface BatchMintProgress {
  percentage: number;
  stage: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';
  message: string;
}

/**
 * Return type for useBatchMint hook
 */
export interface UseBatchMintReturn {
  batchMint: (config: BatchMintConfig) => Promise<MintBatchResult>;
  status: BatchMintStatus;
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: BatchMintError | null;
  result: MintBatchResult | null;
  transactionHash: Hex | null;
  progress: BatchMintProgress;
  reset: () => void;
}

/**
 * React hook for batch minting NFTs with full type safety and detailed progress tracking
 * 
 * @example
 * ```tsx
 * const { batchMint, status, isSuccess, result, progress, error } = useBatchMint();
 * 
 * const handleBatchMint = async () => {
 *   try {
 *     // Mint 10 NFTs without URIs
 *     const result = await batchMint({
 *       contractAddress: "0x...",
 *       to: "0x...",
 *       count: 10
 *     });
 *     console.log("Minted token IDs:", result.tokenIds);
 *   } catch (err) {
 *     console.error("Batch minting failed:", err);
 *   }
 * };
 * 
 * const handleBatchMintWithURIs = async () => {
 *   try {
 *     // Mint NFTs with specific URIs
 *     const result = await batchMint({
 *       contractAddress: "0x...",
 *       to: "0x...",
 *       uris: ["ipfs://...", "ipfs://...", "ipfs://..."]
 *     });
 *     console.log("Minted token IDs:", result.tokenIds);
 *   } catch (err) {
 *     console.error("Batch minting failed:", err);
 *   }
 * };
 * 
 * // Track progress
 * console.log(`${progress.stage}: ${progress.message} (${progress.percentage}%)`);
 * ```
 */
export function useBatchMint(): UseBatchMintReturn {
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<BatchMintStatus>('idle');
  const [error, setError] = useState<BatchMintError | null>(null);
  const [result, setResult] = useState<MintBatchResult | null>(null);
  const [currentHash, setCurrentHash] = useState<Hex | null>(null);

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending: isWritePending,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: hash ?? undefined,
  });

  // Calculate progress with detailed information
  const progress: BatchMintProgress = 
    status === 'idle' ? {
      percentage: 0,
      stage: 'idle',
      message: 'Ready to mint'
    } :
    status === 'preparing' ? {
      percentage: 20,
      stage: 'preparing',
      message: 'Preparing batch mint transaction'
    } :
    status === 'pending' ? {
      percentage: 40,
      stage: 'pending',
      message: 'Waiting for wallet confirmation'
    } :
    status === 'confirming' ? {
      percentage: 70,
      stage: 'confirming',
      message: 'Confirming transaction on blockchain'
    } :
    status === 'success' ? {
      percentage: 100,
      stage: 'success',
      message: `Successfully minted ${result?.tokenIds.length ?? 0} NFTs`
    } :
    status === 'error' ? {
      percentage: 0,
      stage: 'error',
      message: error?.message ?? 'An error occurred'
    } : {
      percentage: 0,
      stage: 'idle',
      message: 'Ready to mint'
    };

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setCurrentHash(null);
    resetWrite();
  }, [resetWrite]);

  // Handle write errors
  if (writeError && status !== 'error') {
    const err: BatchMintError = {
      message: writeError.message,
      code: 'WRITE_ERROR',
      details: writeError,
    };
    setError(err);
    setStatus('error');
  }

  // Track transaction hash
  if (hash && !currentHash) {
    setCurrentHash(hash);
    if (status === 'pending') {
      setStatus('confirming');
    }
  }

  // Handle successful transaction
  if (isTxSuccess && receipt && status !== 'success' && status !== 'error') {
    // Extract tokenIds from Transfer event logs
    // Transfer event: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    const transferLogs = receipt.logs.filter(
      (log) => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );

    if (transferLogs.length > 0) {
      const tokenIds = transferLogs
        .map((log) => log.topics[3] ? BigInt(log.topics[3]) : null)
        .filter((id): id is bigint => id !== null);
      
      const mintBatchResult: MintBatchResult = {
        tokenIds,
        transactionHash: receipt.transactionHash,
      };

      setResult(mintBatchResult);
      setStatus('success');
    } else {
      const err: BatchMintError = {
        message: 'Failed to extract token IDs from transaction receipt',
        code: 'PARSE_ERROR',
      };
      setError(err);
      setStatus('error');
    }
  }

  const batchMint = useCallback(
    async (config: BatchMintConfig): Promise<MintBatchResult> => {
      if (!userAddress) {
        const err: BatchMintError = {
          message: 'Wallet not connected',
          code: 'WALLET_NOT_CONNECTED',
        };
        setError(err);
        setStatus('error');
        throw err;
      }

      // Validate configuration
      if (!config.count && !config.uris) {
        const err: BatchMintError = {
          message: 'Either count or uris must be provided',
          code: 'INVALID_CONFIG',
        };
        setError(err);
        setStatus('error');
        throw err;
      }

      if (config.count && config.uris) {
        const err: BatchMintError = {
          message: 'Cannot provide both count and uris. Use one or the other.',
          code: 'INVALID_CONFIG',
        };
        setError(err);
        setStatus('error');
        throw err;
      }

      try {
        setStatus('preparing');
        setError(null);
        setResult(null);
        setCurrentHash(null);

        setStatus('pending');
        
        // Call mintBaseBatch with either count or uris
        if (config.uris && config.uris.length > 0) {
          writeContract({
            address: config.contractAddress,
            abi: ERC721CreatorABI,
            functionName: 'mintBaseBatch',
            args: [config.to, config.uris],
          });
        } else if (config.count) {
          writeContract({
            address: config.contractAddress,
            abi: ERC721CreatorABI,
            functionName: 'mintBaseBatch',
            args: [config.to, config.count],
          });
        }

        // Return a promise that resolves when batch minting is complete
        return new Promise<MintBatchResult>((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (result) {
              clearInterval(checkInterval);
              resolve(result);
            }
            if (status === 'error' && error) {
              clearInterval(checkInterval);
              reject(error);
            }
          }, 100);

          // Timeout after 3 minutes (batch mints can take longer)
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!result) {
              const timeoutErr: BatchMintError = {
                message: 'Batch minting timed out',
                code: 'TIMEOUT',
              };
              setError(timeoutErr);
              setStatus('error');
              reject(timeoutErr);
            }
          }, 180000);
        });
      } catch (err) {
        const mintError: BatchMintError = {
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          code: 'BATCH_MINT_ERROR',
          details: err,
        };
        setError(mintError);
        setStatus('error');
        throw mintError;
      }
    },
    [userAddress, writeContract, result, status, error]
  );

  return {
    batchMint,
    status,
    isIdle: status === 'idle',
    isPreparing: status === 'preparing',
    isPending: status === 'pending' || isWritePending,
    isConfirming: status === 'confirming' || isConfirming,
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    result,
    transactionHash: currentHash,
    progress,
    reset,
  };
}
