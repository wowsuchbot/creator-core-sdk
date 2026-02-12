/**
 * React hook for batch uploading NFT metadata to IPFS
 */

import { useState, useCallback } from 'react';
import { createIPFSClient } from '../../storage/ipfs';
import type {
  NFTMetadata,
  BatchUploadResponse,
  BatchUploadProgress,
  IPFSUploadOptions,
} from '../../metadata/types';

export type BatchUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UseBatchUploadOptions extends IPFSUploadOptions {
  /** Number of concurrent uploads (default: 5) */
  concurrency?: number;
  /** Callback when upload succeeds */
  onSuccess?: (result: BatchUploadResponse) => void;
  /** Callback when upload fails */
  onError?: (error: Error) => void;
  /** Callback for progress updates */
  onProgress?: (progress: BatchUploadProgress) => void;
}

export interface UseBatchUploadReturn {
  /** Upload multiple metadata objects to IPFS */
  uploadBatch: (metadataArray: NFTMetadata[]) => Promise<BatchUploadResponse | null>;
  /** Current upload status */
  status: BatchUploadStatus;
  /** Current progress information */
  progress: BatchUploadProgress | null;
  /** Upload results if successful */
  results: BatchUploadResponse | null;
  /** Error if upload failed */
  error: Error | null;
  /** Whether currently uploading */
  isUploading: boolean;
  /** Whether upload succeeded */
  isSuccess: boolean;
  /** Whether upload failed */
  isError: boolean;
  /** Reset state to idle */
  reset: () => void;
}

/**
 * Hook for batch uploading NFT metadata to IPFS with progress tracking
 * 
 * @example
 * ```typescript
 * const { uploadBatch, progress, isUploading } = useBatchUpload({
 *   concurrency: 5,
 *   onProgress: (progress) => {
 *     console.log(`${progress.successful}/${progress.total} uploaded`);
 *   }
 * });
 * 
 * const handleBatchUpload = async () => {
 *   const metadataArray = [
 *     { name: 'NFT #1', description: '...', image: 'ipfs://...' },
 *     { name: 'NFT #2', description: '...', image: 'ipfs://...' },
 *     // ... 100 more
 *   ];
 *   
 *   const result = await uploadBatch(metadataArray);
 *   if (result?.success) {
 *     console.log('All uploaded!', result.results);
 *   }
 * };
 * ```
 */
export function useBatchUpload(
  options: UseBatchUploadOptions = {}
): UseBatchUploadReturn {
  const [status, setStatus] = useState<BatchUploadStatus>('idle');
  const [progress, setProgress] = useState<BatchUploadProgress | null>(null);
  const [results, setResults] = useState<BatchUploadResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const { concurrency = 5, onSuccess, onError, onProgress, ...ipfsOptions } = options;

  const uploadBatch = useCallback(
    async (metadataArray: NFTMetadata[]): Promise<BatchUploadResponse | null> => {
      setStatus('uploading');
      setError(null);
      setResults(null);
      setProgress({
        inProgress: 0,
        total: metadataArray.length,
        successful: 0,
        failed: 0,
        errors: [],
      });

      try {
        const client = createIPFSClient(ipfsOptions);
        
        // Internal progress handler
        const handleProgress = (batchProgress: BatchUploadProgress): void => {
          setProgress(batchProgress);
          if (onProgress) {
            onProgress(batchProgress);
          }
        };

        const uploadResult = await client.uploadBatch(
          metadataArray,
          handleProgress,
          concurrency
        );
        
        setStatus('success');
        setResults(uploadResult);
        setProgress(uploadResult.progress);
        
        if (onSuccess) {
          onSuccess(uploadResult);
        }
        
        client.disconnect();
        return uploadResult;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error(String(err));
        setStatus('error');
        setError(uploadError);
        
        if (onError) {
          onError(uploadError);
        }
        
        return null;
      }
    },
    [concurrency, onSuccess, onError, onProgress, ipfsOptions]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(null);
    setResults(null);
    setError(null);
  }, []);

  return {
    uploadBatch,
    status,
    progress,
    results,
    error,
    isUploading: status === 'uploading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset,
  };
}
