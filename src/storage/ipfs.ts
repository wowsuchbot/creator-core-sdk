/**
 * IPFS client for uploading NFT metadata
 * Uses NFT.Storage public gateway for uploads
 */

import { create, IPFSHTTPClient } from 'ipfs-http-client';
import type {
  IPFSUploadResponse,
  IPFSUploadOptions,
  BatchUploadResponse,
  BatchUploadResult,
  BatchUploadProgress,
  NFTMetadata,
} from '../metadata/types';
import { IPFSError } from '../metadata/types';

/**
 * Default IPFS gateway URL
 */
const DEFAULT_GATEWAY = 'https://nft.storage';

/**
 * Default IPFS HTTP API endpoint (NFT.Storage public endpoint)
 */
const DEFAULT_IPFS_API = 'https://api.nft.storage';

/**
 * Default upload options
 */
const DEFAULT_OPTIONS: Required<IPFSUploadOptions> = {
  gateway: DEFAULT_GATEWAY,
  timeout: 30000,
  retries: 3,
  pin: true,
};

/**
 * IPFS client for uploading metadata
 */
export class IPFSClient {
  private client: IPFSHTTPClient | null = null;
  private options: Required<IPFSUploadOptions>;

  /**
   * Create a new IPFS client
   * @param options - Configuration options
   */
  constructor(options: IPFSUploadOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Initialize the IPFS client (lazy initialization)
   */
  private getClient(): IPFSHTTPClient {
    if (!this.client) {
      this.client = create({
        url: DEFAULT_IPFS_API,
        timeout: this.options.timeout,
      });
    }
    return this.client;
  }

  /**
   * Upload a single metadata JSON to IPFS
   * @param metadata - NFT metadata object
   * @returns IPFS upload response with URLs and hash
   */
  async uploadJSON(metadata: NFTMetadata): Promise<IPFSUploadResponse> {
    return this.uploadWithRetry(metadata, this.options.retries);
  }

  /**
   * Upload metadata with retry logic
   */
  private async uploadWithRetry(
    metadata: NFTMetadata,
    retriesLeft: number
  ): Promise<IPFSUploadResponse> {
    try {
      const client = this.getClient();
      const json = JSON.stringify(metadata);
      const buffer = new TextEncoder().encode(json);

      // Upload to IPFS
      const result = await Promise.race([
        client.add(buffer, { pin: this.options.pin }),
        this.createTimeout(this.options.timeout),
      ]);

      if (!result || typeof result !== 'object' || !('cid' in result)) {
        throw new IPFSError(
          'Invalid response from IPFS',
          'INVALID_RESPONSE'
        );
      }

      const hash = result.cid.toString();
      const url = `ipfs://${hash}`;
      const gatewayUrl = `${this.options.gateway}/ipfs/${hash}`;

      return {
        url,
        hash,
        gatewayUrl,
      };
    } catch (error) {
      // Handle timeout
      if (error instanceof Error && error.message === 'Upload timeout') {
        if (retriesLeft > 0) {
          return this.uploadWithRetry(metadata, retriesLeft - 1);
        }
        throw new IPFSError(
          `Upload timed out after ${this.options.retries} retries`,
          'TIMEOUT',
          error
        );
      }

      // Handle network errors
      if (retriesLeft > 0 && this.isRetryableError(error)) {
        return this.uploadWithRetry(metadata, retriesLeft - 1);
      }

      // Throw wrapped error
      throw new IPFSError(
        `IPFS upload failed: ${error instanceof Error ? error.message : String(error)}`,
        'UPLOAD_FAILED',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Upload multiple metadata objects in batch with progress tracking
   * @param metadataArray - Array of metadata objects to upload
   * @param onProgress - Optional progress callback
   * @param concurrency - Number of concurrent uploads (default: 5)
   * @returns Batch upload response with results and progress
   */
  async uploadBatch(
    metadataArray: NFTMetadata[],
    onProgress?: (progress: BatchUploadProgress) => void,
    concurrency = 5
  ): Promise<BatchUploadResponse> {
    const total = metadataArray.length;
    const results: BatchUploadResult[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;
    let inProgress = 0;

    // Helper to update progress
    const updateProgress = (): void => {
      if (onProgress) {
        onProgress({
          inProgress,
          total,
          successful,
          failed,
          errors: [...errors],
        });
      }
    };

    // Process uploads in batches with concurrency limit
    for (let i = 0; i < metadataArray.length; i += concurrency) {
      const batch = metadataArray.slice(i, i + concurrency);
      const batchPromises = batch.map(async (metadata, batchIndex) => {
        const index = i + batchIndex;
        inProgress++;
        updateProgress();

        try {
          const response = await this.uploadJSON(metadata);
          inProgress--;
          successful++;
          results.push({
            index,
            success: true,
            response,
          });
          updateProgress();
        } catch (error) {
          inProgress--;
          failed++;
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          errors.push(`Index ${index}: ${errorMessage}`);
          results.push({
            index,
            success: false,
            error: errorMessage,
          });
          updateProgress();
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);
    }

    // Sort results by index
    results.sort((a, b) => a.index - b.index);

    const progress: BatchUploadProgress = {
      inProgress: 0,
      total,
      successful,
      failed,
      errors,
    };

    return {
      results,
      success: failed === 0,
      progress,
    };
  }

  /**
   * Create a timeout promise that rejects
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Upload timeout')), ms);
    });
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const retryableMessages = [
      'network',
      'timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'socket hang up',
    ];

    return retryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg.toLowerCase())
    );
  }

  /**
   * Close the IPFS client connection
   */
  disconnect(): void {
    if (this.client) {
      // IPFS client doesn't have a close method, just null it
      this.client = null;
    }
  }
}

/**
 * Create a default IPFS client instance
 */
export function createIPFSClient(options?: IPFSUploadOptions): IPFSClient {
  return new IPFSClient(options);
}

/**
 * Convenience function to upload a single metadata object
 */
export async function uploadMetadata(
  metadata: NFTMetadata,
  options?: IPFSUploadOptions
): Promise<IPFSUploadResponse> {
  const client = createIPFSClient(options);
  try {
    return await client.uploadJSON(metadata);
  } finally {
    client.disconnect();
  }
}

/**
 * Convenience function to upload multiple metadata objects
 */
export async function uploadMetadataBatch(
  metadataArray: NFTMetadata[],
  onProgress?: (progress: BatchUploadProgress) => void,
  options?: IPFSUploadOptions
): Promise<BatchUploadResponse> {
  const client = createIPFSClient(options);
  try {
    return await client.uploadBatch(metadataArray, onProgress);
  } finally {
    client.disconnect();
  }
}
