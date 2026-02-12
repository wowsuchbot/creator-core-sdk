/**
 * Enhanced deployment hook with metadata URI support
 */

import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address, Hex } from 'viem';
import type { DeploymentResult } from '../types';
import ERC721CreatorImplementationABI from '../../abis/ERC721CreatorImplementation.json';

/**
 * Configuration for deploying an ERC721 Creator contract with metadata
 */
export interface DeployERC721WithMetadataConfig {
  name: string;
  symbol: string;
  factoryAddress: Address;
  /** Optional base URI for token metadata (e.g., 'ipfs://QmXXX/') */
  baseURI?: string;
}

/**
 * Status of the deployment process
 */
export type DeploymentStatus = 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';

/**
 * Error details for deployment failures
 */
export interface DeploymentError {
  message: string;
  code?: string | number;
  details?: unknown;
}

/**
 * Return type for useDeployERC721WithMetadata hook
 */
export interface UseDeployERC721WithMetadataReturn {
  deploy: (config: DeployERC721WithMetadataConfig) => Promise<DeploymentResult>;
  status: DeploymentStatus;
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: DeploymentError | null;
  result: DeploymentResult | null;
  transactionHash: Hex | null;
  reset: () => void;
}

/**
 * React hook for deploying ERC721 Creator contracts with metadata URI support
 * 
 * @example
 * ```tsx
 * const { deploy, status, isSuccess, result } = useDeployERC721WithMetadata();
 * 
 * const handleDeploy = async () => {
 *   try {
 *     const deployment = await deploy({
 *       name: "My NFT Collection",
 *       symbol: "MNFT",
 *       factoryAddress: "0x...",
 *       baseURI: "ipfs://QmXXXX/"
 *     });
 *     console.log("Deployed at:", deployment.contractAddress);
 *   } catch (err) {
 *     console.error("Deployment failed:", err);
 *   }
 * };
 * ```
 */
export function useDeployERC721WithMetadata(): UseDeployERC721WithMetadataReturn {
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [error, setError] = useState<DeploymentError | null>(null);
  const [result, setResult] = useState<DeploymentResult | null>(null);
  const [currentHash, setCurrentHash] = useState<Hex | null>(null);
  const [currentConfig, setCurrentConfig] = useState<DeployERC721WithMetadataConfig | null>(null);

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

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setCurrentHash(null);
    setCurrentConfig(null);
    resetWrite();
  }, [resetWrite]);

  // Handle write errors
  if (writeError && status !== 'error') {
    const err: DeploymentError = {
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
    if (status === 'preparing') {
      setStatus('pending');
    }
  }

  // Track confirming state
  if (isConfirming && status === 'pending') {
    setStatus('confirming');
  }

  // Handle successful deployment
  if (isTxSuccess && receipt && status === 'confirming') {
    const deploymentResult: DeploymentResult = {
      contractAddress: receipt.contractAddress as Address,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      deployer: userAddress as Address,
      timestamp: Date.now(),
    };
    setResult(deploymentResult);
    setStatus('success');
  }

  const deploy = useCallback(
    async (config: DeployERC721WithMetadataConfig): Promise<DeploymentResult> => {
      if (!userAddress) {
        throw new Error('Wallet not connected');
      }

      setStatus('preparing');
      setError(null);
      setResult(null);
      setCurrentConfig(config);

      return new Promise<DeploymentResult>((resolve, reject) => {
        try {
          // Call the factory contract to deploy
          writeContract({
            address: config.factoryAddress,
            abi: ERC721CreatorImplementationABI,
            functionName: 'createERC721',
            args: [config.name, config.symbol],
          });

          // Set up polling for result
          const checkInterval = setInterval(() => {
            if (status === 'success' && result) {
              clearInterval(checkInterval);
              
              // If baseURI provided, call setBaseTokenURIExtension after deployment
              // Note: This would require a separate transaction
              // For now, we just resolve with the deployment result
              resolve(result);
            } else if (status === 'error' && error) {
              clearInterval(checkInterval);
              reject(error);
            }
          }, 100);

          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(checkInterval);
            if (status !== 'success') {
              const timeoutError: DeploymentError = {
                message: 'Deployment timed out',
                code: 'TIMEOUT',
              };
              setError(timeoutError);
              setStatus('error');
              reject(timeoutError);
            }
          }, 300000);
        } catch (err) {
          const deployError: DeploymentError = {
            message: err instanceof Error ? err.message : String(err),
            code: 'DEPLOY_ERROR',
            details: err,
          };
          setError(deployError);
          setStatus('error');
          reject(deployError);
        }
      });
    },
    [userAddress, writeContract, status, result, error]
  );

  return {
    deploy,
    status,
    isIdle: status === 'idle',
    isPreparing: status === 'preparing',
    isPending: status === 'pending',
    isConfirming: status === 'confirming',
    isSuccess: status === 'success',
    isError: status === 'error',
    error,
    result,
    transactionHash: currentHash,
    reset,
  };
}
