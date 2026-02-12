import { useState, useCallback } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import type { Address, Hex } from 'viem';
import type { DeploymentResult } from '../types';
import ERC721CreatorImplementationABI from '../../abis/ERC721CreatorImplementation.json';

/**
 * Configuration for deploying an ERC721 Creator contract
 */
export interface DeployERC721Config {
  name: string;
  symbol: string;
  factoryAddress: Address;
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
 * Return type for useDeployERC721 hook
 */
export interface UseDeployERC721Return {
  deploy: (config: DeployERC721Config) => Promise<DeploymentResult>;
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
 * React hook for deploying ERC721 Creator contracts with full type safety
 * 
 * @example
 * ```tsx
 * const { deploy, status, isSuccess, result, error } = useDeployERC721();
 * 
 * const handleDeploy = async () => {
 *   try {
 *     const deployment = await deploy({
 *       name: "My NFT Collection",
 *       symbol: "MNFT",
 *       factoryAddress: "0x..."
 *     });
 *     console.log("Deployed at:", deployment.contractAddress);
 *   } catch (err) {
 *     console.error("Deployment failed:", err);
 *   }
 * };
 * ```
 */
export function useDeployERC721(): UseDeployERC721Return {
  const { address: userAddress } = useAccount();
  const [status, setStatus] = useState<DeploymentStatus>('idle');
  const [error, setError] = useState<DeploymentError | null>(null);
  const [result, setResult] = useState<DeploymentResult | null>(null);
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

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setResult(null);
    setCurrentHash(null);
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
    if (status === 'pending') {
      setStatus('confirming');
    }
  }

  // Handle successful transaction
  if (isTxSuccess && receipt && status !== 'success' && status !== 'error') {
    // Extract contract address from logs
    // The CreatorCreated event should emit the new contract address
    const creatorLog = receipt.logs.find(
      (log) => log.topics.length > 0 && log.address === currentHash
    );

    if (creatorLog && creatorLog.topics[1]) {
      // Assuming the contract address is in topics[1]
      const contractAddress = `0x${creatorLog.topics[1].slice(26)}` as Address;
      
      const deploymentResult: DeploymentResult = {
        contractAddress,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
      };

      setResult(deploymentResult);
      setStatus('success');
    } else {
      const err: DeploymentError = {
        message: 'Failed to extract contract address from transaction receipt',
        code: 'PARSE_ERROR',
      };
      setError(err);
      setStatus('error');
    }
  }

  const deploy = useCallback(
    async (config: DeployERC721Config): Promise<DeploymentResult> => {
      if (!userAddress) {
        const err: DeploymentError = {
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
        
        // Call the factory contract to deploy a new ERC721 Creator
        writeContract({
          address: config.factoryAddress,
          abi: ERC721CreatorImplementationABI,
          functionName: 'createCreator',
          args: [config.name, config.symbol],
        });

        // Return a promise that resolves when deployment is complete
        return new Promise<DeploymentResult>((resolve, reject) => {
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
              const timeoutErr: DeploymentError = {
                message: 'Deployment timed out',
                code: 'TIMEOUT',
              };
              setError(timeoutErr);
              setStatus('error');
              reject(timeoutErr);
            }
          }, 120000);
        });
      } catch (err) {
        const deploymentError: DeploymentError = {
          message: err instanceof Error ? err.message : 'Unknown error occurred',
          code: 'DEPLOYMENT_ERROR',
          details: err,
        };
        setError(deploymentError);
        setStatus('error');
        throw deploymentError;
      }
    },
    [userAddress, writeContract, result, status, error]
  );

  return {
    deploy,
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
    reset,
  };
}
