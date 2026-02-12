import type { Address } from 'viem';
import type { ContractAddresses } from './types';

// Chain IDs
export const CHAIN_IDS = {
  MAINNET: 1,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
  SEPOLIA: 11155111,
} as const;

// Contract addresses per chain
export const CONTRACT_ADDRESSES: Record<number, ContractAddresses> = {
  [CHAIN_IDS.MAINNET]: {
    erc721CreatorFactory: '0x2d2acD205bd6d9D0B3E79990e093768375AD3a30' as Address,
  },
  [CHAIN_IDS.BASE]: {
    erc721CreatorFactory: '0x2d2acD205bd6d9D0B3E79990e093768375AD3a30' as Address,
  },
  [CHAIN_IDS.BASE_SEPOLIA]: {
    erc721CreatorFactory: '0x2d2acD205bd6d9D0B3E79990e093768375AD3a30' as Address,
  },
  [CHAIN_IDS.SEPOLIA]: {
    erc721CreatorFactory: '0x2d2acD205bd6d9D0B3E79990e093768375AD3a30' as Address,
  },
};

export function getContractAddresses(chainId: number): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses;
}
