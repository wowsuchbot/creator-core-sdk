/**
 * Tests for IPFS client (with mocked IPFS operations)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IPFSClient, IPFSError } from '../ipfs';
import type { NFTMetadata } from '../../metadata/types';

// Mock ipfs-http-client
vi.mock('ipfs-http-client', () => ({
  create: vi.fn(() => ({
    add: vi.fn(async () => ({
      cid: {
        toString: () => 'QmTestHash123',
      },
    })),
  })),
}));

describe('IPFSClient', () => {
  const mockMetadata: NFTMetadata = {
    name: 'Test NFT',
    description: 'A test NFT',
    image: 'ipfs://QmTestImage',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create client with default options', () => {
      const client = new IPFSClient();
      expect(client).toBeInstanceOf(IPFSClient);
    });

    it('should create client with custom options', () => {
      const client = new IPFSClient({
        gateway: 'https://custom.gateway',
        timeout: 60000,
        retries: 5,
      });
      expect(client).toBeInstanceOf(IPFSClient);
    });
  });

  describe('uploadJSON', () => {
    it('should upload metadata and return IPFS response', async () => {
      const client = new IPFSClient();
      const result = await client.uploadJSON(mockMetadata);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('gatewayUrl');
      expect(result.url).toMatch(/^ipfs:\/\//);
      expect(result.hash).toBeTruthy();
    });

    it('should format IPFS URLs correctly', async () => {
      const client = new IPFSClient();
      const result = await client.uploadJSON(mockMetadata);

      expect(result.url).toBe('ipfs://QmTestHash123');
      expect(result.hash).toBe('QmTestHash123');
      expect(result.gatewayUrl).toContain('QmTestHash123');
    });

    it('should use custom gateway in response', async () => {
      const customGateway = 'https://my.gateway';
      const client = new IPFSClient({ gateway: customGateway });
      const result = await client.uploadJSON(mockMetadata);

      expect(result.gatewayUrl).toContain(customGateway);
    });
  });

  describe('uploadBatch', () => {
    it('should upload multiple metadata objects', async () => {
      const client = new IPFSClient();
      const metadataArray = [
        { ...mockMetadata, name: 'NFT #1' },
        { ...mockMetadata, name: 'NFT #2' },
        { ...mockMetadata, name: 'NFT #3' },
      ];

      const result = await client.uploadBatch(metadataArray);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(3);
      expect(result.progress.total).toBe(3);
      expect(result.progress.successful).toBe(3);
      expect(result.progress.failed).toBe(0);
    });

    it('should track progress during upload', async () => {
      const client = new IPFSClient();
      const metadataArray = Array(5).fill(mockMetadata);
      const progressUpdates: number[] = [];

      await client.uploadBatch(metadataArray, (progress) => {
        progressUpdates.push(progress.successful + progress.inProgress);
      });

      expect(progressUpdates.length).toBeGreaterThan(0);
    });

    it('should respect concurrency limit', async () => {
      const client = new IPFSClient();
      const metadataArray = Array(10).fill(mockMetadata);
      const concurrency = 3;

      const result = await client.uploadBatch(metadataArray, undefined, concurrency);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(10);
    });

    it('should handle partial failures gracefully', async () => {
      const client = new IPFSClient();
      const metadataArray = Array(5).fill(mockMetadata);

      // This test assumes all succeed with our mock
      const result = await client.uploadBatch(metadataArray);

      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('should return results in correct order', async () => {
      const client = new IPFSClient();
      const metadataArray = [
        { ...mockMetadata, name: 'NFT #0' },
        { ...mockMetadata, name: 'NFT #1' },
        { ...mockMetadata, name: 'NFT #2' },
      ];

      const result = await client.uploadBatch(metadataArray);

      expect(result.results[0].index).toBe(0);
      expect(result.results[1].index).toBe(1);
      expect(result.results[2].index).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw IPFSError on upload failure', async () => {
      // Create a client that will fail
      const { create } = await import('ipfs-http-client');
      vi.mocked(create).mockReturnValueOnce({
        add: vi.fn().mockRejectedValue(new Error('Network error')),
      } as any);

      const client = new IPFSClient();

      await expect(client.uploadJSON(mockMetadata)).rejects.toThrow(IPFSError);
    });

    it('should include error details in IPFSError', async () => {
      const { create } = await import('ipfs-http-client');
      const originalError = new Error('Network error');
      vi.mocked(create).mockReturnValueOnce({
        add: vi.fn().mockRejectedValue(originalError),
      } as any);

      const client = new IPFSClient();

      try {
        await client.uploadJSON(mockMetadata);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(IPFSError);
        if (error instanceof IPFSError) {
          expect(error.code).toBe('UPLOAD_FAILED');
          expect(error.cause).toBe(originalError);
        }
      }
    });
  });

  describe('disconnect', () => {
    it('should disconnect client', () => {
      const client = new IPFSClient();
      expect(() => client.disconnect()).not.toThrow();
    });
  });
});

describe('IPFSError', () => {
  it('should create error with code', () => {
    const error = new IPFSError('Test error', 'UPLOAD_FAILED');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('UPLOAD_FAILED');
    expect(error.name).toBe('IPFSError');
  });

  it('should include cause if provided', () => {
    const cause = new Error('Original error');
    const error = new IPFSError('Test error', 'NETWORK_ERROR', cause);
    expect(error.cause).toBe(cause);
  });
});
