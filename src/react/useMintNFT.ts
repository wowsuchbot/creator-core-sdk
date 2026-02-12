import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address, Hex } from 'viem';
import type { MintResult } from '../types';
import ERC721CreatorABI from '../../abis/ERC721Creator.json';

/**
 * Configuration for minting a single NFT
 */
export interface MintNFTConfig {
  contractAddress: Address;
  to: Address;
  uri?: string;
}

/**
 * Status of the minting process
 */
export type MintStatus = 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';

/**
 * Error details for minting failures
 */
export interface MintError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Return type for useMintNFT hook
 */
export interface UseMintNFTReturn {
  mint: (config: MintNFTConfig) => Promise<MintResult>;
  status: MintStatus;
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: MintError | null;
  result: MintResult | null;
  transactionHash: Hex | null;
  progress: number;
  reset: () => void;
}

/**
 * React hook for minting single NFTs with full type safety and transaction tracking
 * 
 * @example
 * ```tsx
 * const { mint, status, isSuccess, result, progress, error } = useMintNFT();
 * 
 * const handleMint = async () => {
 *   try {
 *     const mintResult = await mint({
 *       contractAddress: "0x...",
 *       to: "0x...",
 *       uri: "ipfs://..."
 *     });
 *     console.log("Minted token ID:", mintResult.tokenId);
 *   } catch (err) {
 *     console.error("Minting failed:", err);
 *   }
 * };
 * 
 * // Track progress: 0 = idle, 25 = preparing, 50 = pending, 75 = confirming, 100 = success
 * console.log(`Progress: ${progress}%`);
 * ```
 */
export function useMintNFT(): UseMintNFTReturn {
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<MintError | null>(null);
  const [result, setResult] = useState<MintResult | null>(null);
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

  // Calculate progress percentage based on status
  const progress = 
    status === 'idle' ? 0 :
    status === 'preparing' ? 25 :
    status === 'pending' ? 50 :
    status === 'confirming' ? 75 :
    status === 'success' ? 100 :
    status === 'error' ? 0 : 0;

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setCurrentHash(null);
    resetWrite();
  }, [resetWrite]);

  // Handle write errors
  if (writeError && status !== 'error') {
    const err: MintError = {
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
    // Extract tokenId from Transfer event logs
    // Transfer event: Transfer(address indexed from, address indexed to, uint256 indexed tokenId)
    const transferLog = receipt.logs.find(
      (log) => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );

    if (transferLog && transferLog.topics[3]) {
      const tokenId = BigInt(transferLog.topics[3]);
      
      const mintResult: MintResult = {
        tokenId,
        transactionHash: receipt.transactionHash,
      };

      setResult(mintResult);
      setStatus('success');
    } else {
      const err: MintError = {
        message: 'Failed to extract token ID from transaction receipt',
        code: 'PARSE_ERROR',
      };
      setError(err);
      setStatus('error');
    }
  }

  const mint = useCallback(
    async (config: MintNFTConfig): Promise<MintResult> => {
      if (!userAddress) {
        const err: MintError = {
          message: 'Wallet not connected',
          code: 'WALLET_NOT_CONNECTED',
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
        
        // Call mintBase or mintBaseNew depending on whether URI is provided
        if (config.uri) {
          writeContract({
            address: config.contractAddress,
            abi: ERC721CreatorABI,
            functionName: 'mintBase',
            args: [config.to, config.uri],
          });
        } else {
          writeContract({
            address: config.contractAddress,
            abi: ERC721CreatorABI,
            functionName: 'mintBase',
            args: [config.to],
          });
        }

        // Return a promise that resolves when minting is complete
        return new Promise<MintResult>((resolve, reject) => {
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

          // Timeout after 2 minutes
          setTimeout(() => {
            clearInterval(checkInterval);
            if (!result) {
              const timeoutErr: MintError = {
                message: 'Minting timed out',
                code: 'TIMEOUT',
              };
              setError(timeoutErr);
              setStatus('error');
              reject(timeoutErr);
            }
          }, 120000);
        });
      } catch (err) {
        const mintError: MintError = {
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          code: 'MINT_ERROR',
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
    mint,
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
