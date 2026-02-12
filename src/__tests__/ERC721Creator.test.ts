import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ERC721Creator } from '../clients/ERC721Creator';
import type { Address, PublicClient, WalletClient } from 'viem';

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    getContract: vi.fn(() => ({
      read: {
        tokenURI: vi.fn(async () => 'ipfs://test-token-uri'),
        balanceOf: vi.fn(async () => 5n),
        name: vi.fn(async () => 'Test Collection'),
        symbol: vi.fn(async () => 'TEST'),
        owner: vi.fn(async () => '0x1234567890123456789012345678901234567890'),
      },
      write: {
        mintBase: vi.fn(async () => '0xminthash' as Address),
        mintBaseBatch: vi.fn(async () => '0xbatchhash' as Address),
      },
    })),
  };
});

describe('ERC721Creator', () => {
  let creator: ERC721Creator;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;
  const contractAddress = '0x1234567890123456789012345678901234567890' as Address;
  const recipientAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' as Address;

  beforeEach(() => {
    mockPublicClient = {
      waitForTransactionReceipt: vi.fn(async () => ({
        logs: [
          {
            topics: ['0xtopic1', '0xtopic2', '0xtopic3', '0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
        ],
      })),
    } as any;

    mockWalletClient = {
      account: { address: '0x1234567890123456789012345678901234567890' as Address },
    } as any;

    creator = new ERC721Creator(contractAddress, mockPublicClient, mockWalletClient);
  });

  describe('constructor', () => {
    it('should initialize with contract address', () => {
      expect(creator.address).toBe(contractAddress);
    });

    it('should work without wallet client', () => {
      const readOnlyCreator = new ERC721Creator(contractAddress, mockPublicClient);
      expect(readOnlyCreator.address).toBe(contractAddress);
    });
  });

  describe('mint', () => {
    it('should mint a single NFT without URI', async () => {
      const result = await creator.mint(recipientAddress);

      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('transactionHash');
      expect(result.transactionHash).toBe('0xminthash');
      expect(result.tokenId).toBe(1n);
    });

    it('should mint a single NFT with URI', async () => {
      const uri = 'ipfs://QmTest123';
      const result = await creator.mint(recipientAddress, uri);

      expect(result).toHaveProperty('tokenId');
      expect(result).toHaveProperty('transactionHash');
      expect(result.transactionHash).toBe('0xminthash');
    });

    it('should throw error without wallet client', async () => {
      const readOnlyCreator = new ERC721Creator(contractAddress, mockPublicClient);

      await expect(readOnlyCreator.mint(recipientAddress)).rejects.toThrow(
        'Wallet client required for minting'
      );
    });

    it('should throw error without wallet account', async () => {
      const creatorNoAccount = new ERC721Creator(
        contractAddress,
        mockPublicClient,
        { account: null } as any
      );

      await expect(creatorNoAccount.mint(recipientAddress)).rejects.toThrow(
        'Wallet account not found'
      );
    });
  });

  describe('mintBatch', () => {
    it('should mint multiple NFTs with count', async () => {
      mockPublicClient.waitForTransactionReceipt = vi.fn(async () => ({
        logs: [
          {
            topics: ['0x', '0x', '0x', '0x0000000000000000000000000000000000000000000000000000000000000001'],
          },
          {
            topics: ['0x', '0x', '0x', '0x0000000000000000000000000000000000000000000000000000000000000002'],
          },
          {
            topics: ['0x', '0x', '0x', '0x0000000000000000000000000000000000000000000000000000000000000003'],
          },
        ],
      })) as any;

      const result = await creator.mintBatch(recipientAddress, 3);

      expect(result).toHaveProperty('tokenIds');
      expect(result).toHaveProperty('transactionHash');
      expect(result.transactionHash).toBe('0xbatchhash');
      expect(result.tokenIds).toHaveLength(3);
      expect(result.tokenIds).toEqual([1n, 2n, 3n]);
    });

    it('should mint multiple NFTs with URIs', async () => {
      const uris = ['ipfs://QmTest1', 'ipfs://QmTest2', 'ipfs://QmTest3'];

      mockPublicClient.waitForTransactionReceipt = vi.fn(async () => ({
        logs: uris.map((_, i) => ({
          topics: ['0x', '0x', '0x', `0x000000000000000000000000000000000000000000000000000000000000000${i + 1}`],
        })),
      })) as any;

      const result = await creator.mintBatch(recipientAddress, undefined, uris);

      expect(result.tokenIds).toHaveLength(3);
      expect(result.transactionHash).toBe('0xbatchhash');
    });

    it('should throw error without count or URIs', async () => {
      await expect(creator.mintBatch(recipientAddress)).rejects.toThrow(
        'Either count or uris must be provided'
      );
    });

    it('should throw error without wallet client', async () => {
      const readOnlyCreator = new ERC721Creator(contractAddress, mockPublicClient);

      await expect(readOnlyCreator.mintBatch(recipientAddress, 3)).rejects.toThrow(
        'Wallet client required for minting'
      );
    });
  });

  describe('read methods', () => {
    it('should get token URI', async () => {
      const uri = await creator.tokenURI(1n);
      expect(uri).toBe('ipfs://test-token-uri');
    });

    it('should get balance of address', async () => {
      const balance = await creator.balanceOf(recipientAddress);
      expect(balance).toBe(5n);
    });

    it('should get contract name', async () => {
      const name = await creator.name();
      expect(name).toBe('Test Collection');
    });

    it('should get contract symbol', async () => {
      const symbol = await creator.symbol();
      expect(symbol).toBe('TEST');
    });

    it('should get contract owner', async () => {
      const owner = await creator.owner();
      expect(owner).toBe('0x1234567890123456789012345678901234567890');
    });
  });
});
