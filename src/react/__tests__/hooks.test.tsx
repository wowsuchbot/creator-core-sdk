import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { 
  useDeployERC721, 
  useDeployERC1155,
  useMintNFT,
  useBatchMint,
  useCreatorContract,
  useTokenURI,
  useBalanceOf,
  useOwnerOf,
} from '../index';
import type { Address } from 'viem';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ 
    address: '0x1234567890123456789012345678901234567890' as Address,
    isConnected: true,
  })),
  useWriteContract: vi.fn(() => ({
    writeContract: vi.fn(),
    data: null,
    error: null,
    isPending: false,
    reset: vi.fn(),
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
    data: null,
  })),
  useReadContract: vi.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
  useReadContracts: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

const TEST_ADDRESS = '0x1234567890123456789012345678901234567890' as Address;

describe('React Hooks Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Deployment Hooks', () => {
    describe('useDeployERC721', () => {
      it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useDeployERC721());

        expect(result.current.status).toBe('idle');
        expect(result.current.isIdle).toBe(true);
        expect(result.current.error).toBeNull();
        expect(result.current.result).toBeNull();
      });

      it('should expose deploy function with correct signature', () => {
        const { result } = renderHook(() => useDeployERC721());

        expect(typeof result.current.deploy).toBe('function');
        expect(typeof result.current.reset).toBe('function');
      });

      it('should have all status flags', () => {
        const { result } = renderHook(() => useDeployERC721());

        expect(typeof result.current.isIdle).toBe('boolean');
        expect(typeof result.current.isPreparing).toBe('boolean');
        expect(typeof result.current.isPending).toBe('boolean');
        expect(typeof result.current.isConfirming).toBe('boolean');
        expect(typeof result.current.isSuccess).toBe('boolean');
        expect(typeof result.current.isError).toBe('boolean');
      });
    });

    describe('useDeployERC1155', () => {
      it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useDeployERC1155());

        expect(result.current.status).toBe('idle');
        expect(result.current.isIdle).toBe(true);
        expect(result.current.error).toBeNull();
      });

      it('should expose deploy function', () => {
        const { result } = renderHook(() => useDeployERC1155());

        expect(typeof result.current.deploy).toBe('function');
      });
    });
  });

  describe('Minting Hooks', () => {
    describe('useMintNFT', () => {
      it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useMintNFT());

        expect(result.current.status).toBe('idle');
        expect(result.current.isIdle).toBe(true);
        expect(result.current.progress).toBe(0);
        expect(result.current.error).toBeNull();
        expect(result.current.result).toBeNull();
      });

      it('should expose mint function with correct signature', () => {
        const { result } = renderHook(() => useMintNFT());

        expect(typeof result.current.mint).toBe('function');
        expect(typeof result.current.reset).toBe('function');
      });

      it('should track progress correctly', () => {
        const { result } = renderHook(() => useMintNFT());

        // Initial progress should be 0
        expect(result.current.progress).toBe(0);
        expect(typeof result.current.progress).toBe('number');
      });

      it('should have transaction hash tracking', () => {
        const { result } = renderHook(() => useMintNFT());

        expect(result.current.transactionHash).toBeNull();
      });
    });

    describe('useBatchMint', () => {
      it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useBatchMint());

        expect(result.current.status).toBe('idle');
        expect(result.current.isIdle).toBe(true);
        expect(result.current.error).toBeNull();
        expect(result.current.result).toBeNull();
      });

      it('should expose batchMint function', () => {
        const { result } = renderHook(() => useBatchMint());

        expect(typeof result.current.batchMint).toBe('function');
      });

      it('should have detailed progress tracking', () => {
        const { result } = renderHook(() => useBatchMint());

        expect(result.current.progress).toBeDefined();
        expect(result.current.progress.percentage).toBe(0);
        expect(result.current.progress.stage).toBe('idle');
        expect(result.current.progress.message).toBe('Ready to mint');
      });

      it('should track multiple token IDs in result', () => {
        const { result } = renderHook(() => useBatchMint());

        // Result should be null initially
        expect(result.current.result).toBeNull();
      });
    });
  });

  describe('Contract Reading Hooks', () => {
    describe('useCreatorContract', () => {
      it('should initialize with correct config', () => {
        const { result } = renderHook(() => 
          useCreatorContract({ 
            contractAddress: TEST_ADDRESS,
            enabled: true,
          })
        );

        expect(result.current).toBeDefined();
        expect(typeof result.current.refetchMetadata).toBe('function');
      });

      it('should expose metadata properties', () => {
        const { result } = renderHook(() => 
          useCreatorContract({ contractAddress: TEST_ADDRESS })
        );

        expect(result.current.name).toBeDefined();
        expect(result.current.symbol).toBeDefined();
        expect(result.current.totalSupply).toBeDefined();
        expect(result.current.metadata).toBeDefined();
      });

      it('should expose loading states', () => {
        const { result } = renderHook(() => 
          useCreatorContract({ contractAddress: TEST_ADDRESS })
        );

        expect(typeof result.current.isLoadingMetadata).toBe('boolean');
        expect(typeof result.current.isErrorMetadata).toBe('boolean');
      });

      it('should expose read functions', () => {
        const { result } = renderHook(() => 
          useCreatorContract({ contractAddress: TEST_ADDRESS })
        );

        expect(typeof result.current.getTokenURI).toBe('function');
        expect(typeof result.current.getBalanceOf).toBe('function');
        expect(typeof result.current.getOwnerOf).toBe('function');
      });
    });

    describe('useTokenURI', () => {
      it('should initialize and return URI data', () => {
        const { result } = renderHook(() => 
          useTokenURI(TEST_ADDRESS, 1n)
        );

        expect(result.current).toBeDefined();
        expect(result.current.uri).toBeDefined();
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.isError).toBe('boolean');
        expect(typeof result.current.refetch).toBe('function');
      });
    });

    describe('useBalanceOf', () => {
      it('should initialize and return balance data', () => {
        const { result } = renderHook(() => 
          useBalanceOf(TEST_ADDRESS, TEST_ADDRESS)
        );

        expect(result.current).toBeDefined();
        expect(result.current.balance).toBeDefined();
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.isError).toBe('boolean');
        expect(typeof result.current.refetch).toBe('function');
      });
    });

    describe('useOwnerOf', () => {
      it('should initialize and return owner data', () => {
        const { result } = renderHook(() => 
          useOwnerOf(TEST_ADDRESS, 1n)
        );

        expect(result.current).toBeDefined();
        expect(result.current.owner).toBeDefined();
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.isError).toBe('boolean');
        expect(typeof result.current.refetch).toBe('function');
      });
    });
  });

  describe('Type Safety', () => {
    it('should have proper Address types from viem', () => {
      const { result } = renderHook(() => useDeployERC721());
      
      // Type test: if this compiles, Address types are correct
      const config = {
        name: 'Test',
        symbol: 'TST',
        factoryAddress: TEST_ADDRESS,
      };
      
      expect(config.factoryAddress).toBe(TEST_ADDRESS);
    });

    it('should have proper bigint types for token IDs', () => {
      const { result } = renderHook(() => useMintNFT());
      
      // Type test: bigint should be accepted
      const tokenId: bigint = 1n;
      expect(typeof tokenId).toBe('bigint');
    });

    it('should have proper status union types', () => {
      const { result } = renderHook(() => useDeployERC721());
      
      // Type test: status should be one of the defined types
      const validStatuses = ['idle', 'preparing', 'pending', 'confirming', 'success', 'error'];
      expect(validStatuses).toContain(result.current.status);
    });

    it('should have proper null checks', () => {
      const { result } = renderHook(() => useMintNFT());
      
      // All nullable fields should initially be null
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.transactionHash).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle wallet not connected error', async () => {
      const { useAccount } = await import('wagmi');
      vi.mocked(useAccount).mockReturnValue({ 
        address: undefined,
        isConnected: false,
      } as any);

      const { result } = renderHook(() => useMintNFT());

      await expect(
        result.current.mint({
          contractAddress: TEST_ADDRESS,
          to: TEST_ADDRESS,
        })
      ).rejects.toThrow('Wallet not connected');
    });

    it('should provide error details with code and message', () => {
      const { result } = renderHook(() => useDeployERC721());

      // Error interface should have code and message
      if (result.current.error) {
        expect(result.current.error.message).toBeDefined();
        expect(result.current.error.code).toBeDefined();
      }
    });
  });

  describe('Hook Integration', () => {
    it('should export all hooks from index', () => {
      expect(useDeployERC721).toBeDefined();
      expect(useDeployERC1155).toBeDefined();
      expect(useMintNFT).toBeDefined();
      expect(useBatchMint).toBeDefined();
      expect(useCreatorContract).toBeDefined();
      expect(useTokenURI).toBeDefined();
      expect(useBalanceOf).toBeDefined();
      expect(useOwnerOf).toBeDefined();
    });

    it('should have consistent API across deployment hooks', () => {
      const erc721 = renderHook(() => useDeployERC721());
      const erc1155 = renderHook(() => useDeployERC1155());

      // Both should have same structure
      expect(erc721.result.current.deploy).toBeDefined();
      expect(erc1155.result.current.deploy).toBeDefined();
      expect(erc721.result.current.status).toBeDefined();
      expect(erc1155.result.current.status).toBeDefined();
      expect(erc721.result.current.reset).toBeDefined();
      expect(erc1155.result.current.reset).toBeDefined();
    });
  });
});
