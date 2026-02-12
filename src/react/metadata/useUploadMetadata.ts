/**
 * React hook for uploading single NFT metadata to IPFS
 */

import { useState, useCallback } from 'react';
import { createIPFSClient } from '../../storage/ipfs';
import type {
  NFTMetadata,
  IPFSUploadResponse,
  IPFSUploadOptions,
} from '../../metadata/types';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UseUploadMetadataOptions extends IPFSUploadOptions {
  /** Callback when upload succeeds */
  onSuccess?: (result: IPFSUploadResponse) => void;
  /** Callback when upload fails */
  onError?: (error: Error) => void;
}

export interface UseUploadMetadataReturn {
  /** Upload a metadata object to IPFS */
  upload: (metadata: NFTMetadata) => Promise<IPFSUploadResponse | null>;
  /** Current upload status */
  status: UploadStatus;
  /** Upload result if successful */
  result: IPFSUploadResponse | null;
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
 * Hook for uploading NFT metadata to IPFS
 * 
 * @example
 * ```typescript
 * const { upload, status, result, isUploading } = useUploadMetadata({
 *   onSuccess: (result) => console.log('Uploaded:', result.url),
 *   onError: (error) => console.error('Failed:', error)
 * });
 * 
 * const handleUpload = async () => {
 *   const metadata = {
 *     name: 'My NFT',
 *     description: 'Cool NFT',
 *     image: 'ipfs://...'
 *   };
 *   
 *   const result = await upload(metadata);
 *   if (result) {
 *     console.log('IPFS URL:', result.url);
 *   }
 * };
 * ```
 */
export function useUploadMetadata(
  options: UseUploadMetadataOptions = {}
): UseUploadMetadataReturn {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [result, setResult] = useState<IPFSUploadResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (metadata: NFTMetadata): Promise<IPFSUploadResponse | null> => {
      setStatus('uploading');
      setError(null);
      setResult(null);

      try {
        const client = createIPFSClient(options);
        const uploadResult = await client.uploadJSON(metadata);
        
        setStatus('success');
        setResult(uploadResult);
        
        if (options.onSuccess) {
          options.onSuccess(uploadResult);
        }
        
        client.disconnect();
        return uploadResult;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error(String(err));
        setStatus('error');
        setError(uploadError);
        
        if (options.onError) {
          options.onError(uploadError);
        }
        
        return null;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    upload,
    status,
    result,
    error,
    isUploading: status === 'uploading',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset,
  };
}
