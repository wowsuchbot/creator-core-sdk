import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDeployERC721 } from '../useDeployERC721';
import type { Address } from 'viem';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: '0x1234567890123456789012345678901234567890' as Address })),
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
}));

describe('useDeployERC721', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with idle status', () => {
    const { result } = renderHook(() => useDeployERC721());

    expect(result.current.status).toBe('idle');
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isConfirming).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.result).toBeNull();
    expect(result.current.transactionHash).toBeNull();
  });

  it('should have a deploy function', () => {
    const { result } = renderHook(() => useDeployERC721());

    expect(typeof result.current.deploy).toBe('function');
  });

  it('should have a reset function', () => {
    const { result } = renderHook(() => useDeployERC721());

    expect(typeof result.current.reset).toBe('function');
  });

  it('should throw error when wallet not connected', async () => {
    const { useAccount } = await import('wagmi');
    vi.mocked(useAccount).mockReturnValue({ 
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      isReconnecting: false,
      status: 'disconnected',
    } as any);

    const { result } = renderHook(() => useDeployERC721());

    await expect(
      result.current.deploy({
        name: 'Test Collection',
        symbol: 'TEST',
        factoryAddress: '0x1234567890123456789012345678901234567890' as Address,
      })
    ).rejects.toThrow('Wallet not connected');
  });

  it('should accept valid deployment config', async () => {
    const { result } = renderHook(() => useDeployERC721());

    const config = {
      name: 'Test Collection',
      symbol: 'TEST',
      factoryAddress: '0x1234567890123456789012345678901234567890' as Address,
    };

    expect(() => result.current.deploy(config)).not.toThrow();
  });

  it('should export all required types', () => {
    // Type-only test - if this compiles, types are exported correctly
    const config: import('../useDeployERC721').DeployERC721Config = {
      name: 'Test',
      symbol: 'TST',
      factoryAddress: '0x1234567890123456789012345678901234567890' as Address,
    };

    expect(config).toBeDefined();
  });

  it('should have proper TypeScript types for return value', () => {
    const { result } = renderHook(() => useDeployERC721());

    // Type assertions to verify TypeScript types
    const returnValue: import('../useDeployERC721').UseDeployERC721Return = result.current;
    
    expect(returnValue).toBeDefined();
    expect(returnValue.deploy).toBeDefined();
    expect(returnValue.status).toBeDefined();
    expect(returnValue.reset).toBeDefined();
  });
});
