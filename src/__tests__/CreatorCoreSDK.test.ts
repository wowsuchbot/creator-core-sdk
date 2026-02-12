import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreatorCoreSDK } from '../CreatorCoreSDK';
import type { Address, PublicClient, WalletClient } from 'viem';

// Mock viem
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    getContract: vi.fn(() => ({
      write: {
        createCreator: vi.fn(async () => '0xmockhash' as Address),
      },
      abi: [
        {
          name: 'CreatorDeployed',
          signature: '0xmocksignature',
        },
      ],
    })),
  };
});

describe('CreatorCoreSDK', () => {
  let sdk: CreatorCoreSDK;
  let mockPublicClient: PublicClient;
  let mockWalletClient: WalletClient;

  beforeEach(() => {
    mockPublicClient = {
      chain: { id: 1 },
      waitForTransactionReceipt: vi.fn(async () => ({
        blockNumber: 12345n,
        logs: [
          {
            topics: [
              '0xmocksignature',
              '0x000000000000000000000000abcdef1234567890abcdef1234567890abcdef12',
            ],
          },
        ],
      })),
    } as any;

    mockWalletClient = {
      account: { address: '0x1234567890123456789012345678901234567890' as Address },
    } as any;

    sdk = new CreatorCoreSDK(mockPublicClient, mockWalletClient);
  });

  describe('constructor', () => {
    it('should initialize with public client only', () => {
      const sdkNoWallet = new CreatorCoreSDK(mockPublicClient);
      expect(sdkNoWallet).toBeInstanceOf(CreatorCoreSDK);
    });

    it('should use chain ID from config', () => {
      const sdkWithConfig = new CreatorCoreSDK(mockPublicClient, mockWalletClient, {
        chainId: 5,
      });
      expect(sdkWithConfig.getChainId()).toBe(5);
    });

    it('should use chain ID from public client', () => {
      expect(sdk.getChainId()).toBe(1);
    });

    it('should use custom factory address from config', () => {
      const customFactory = '0x9999999999999999999999999999999999999999' as Address;
      const sdkWithFactory = new CreatorCoreSDK(mockPublicClient, mockWalletClient, {
        factoryAddress: customFactory,
      });
      expect(sdkWithFactory.getFactoryAddress()).toBe(customFactory);
    });
  });

  describe('deployERC721', () => {
    it('should deploy ERC721 contract successfully', async () => {
      const result = await sdk.deployERC721({
        name: 'Test Collection',
        symbol: 'TEST',
      });

      expect(result).toHaveProperty('contractAddress');
      expect(result).toHaveProperty('transactionHash');
      expect(result).toHaveProperty('blockNumber');
      expect(result.transactionHash).toBe('0xmockhash');
      expect(result.blockNumber).toBe(12345n);
    });

    it('should throw error without wallet client', async () => {
      const sdkNoWallet = new CreatorCoreSDK(mockPublicClient);

      await expect(
        sdkNoWallet.deployERC721({
          name: 'Test Collection',
          symbol: 'TEST',
        })
      ).rejects.toThrow('Wallet client required for deployment');
    });

    it('should throw error without wallet account', async () => {
      const sdkNoAccount = new CreatorCoreSDK(mockPublicClient, {
        account: null,
      } as any);

      await expect(
        sdkNoAccount.deployERC721({
          name: 'Test Collection',
          symbol: 'TEST',
        })
      ).rejects.toThrow('Wallet account not found');
    });
  });

  describe('getERC721Creator', () => {
    it('should return ERC721Creator instance', () => {
      const address = '0x1234567890123456789012345678901234567890' as Address;
      const creator = sdk.getERC721Creator(address);

      expect(creator).toBeDefined();
      expect(creator.address).toBe(address);
    });
  });

  describe('getFactoryAddress', () => {
    it('should return factory address', () => {
      const factoryAddress = sdk.getFactoryAddress();
      expect(factoryAddress).toBeDefined();
      expect(typeof factoryAddress).toBe('string');
    });
  });

  describe('getChainId', () => {
    it('should return chain ID', () => {
      const chainId = sdk.getChainId();
      expect(chainId).toBe(1);
    });
  });
});
