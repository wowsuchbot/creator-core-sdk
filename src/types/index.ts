/**
 * Core TypeScript types and interfaces
 * @module types
 */

import type { Address, Hash, TransactionReceipt } from 'viem';

/**
 * Deployment options for creator contracts
 */
export interface DeploymentOptions {
  /** Contract name */
  name: string;
  /** Contract symbol */
  symbol: string;
  /** Whether to deploy upgradeable variant */
  upgradeable?: boolean;
  /** Whether to deploy enumerable variant (ERC721 only) */
  enumerable?: boolean;
  /** Royalty basis points (e.g., 500 = 5%) */
  royaltyBps?: number;
  /** Royalty receiver address */
  royaltyReceiver?: Address;
}

/**
 * Result of contract deployment
 */
export interface DeploymentResult {
  /** Deployed contract address */
  contractAddress: Address;
  /** Transaction hash */
  transactionHash: Hash;
  /** Full transaction receipt */
  receipt: TransactionReceipt;
  /** Gas used */
  gasUsed: bigint;
}

/**
 * Options for minting a single token
 */
export interface MintOptions {
  /** Contract address to mint from */
  contractAddress: Address;
  /** Recipient address */
  to: Address;
  /** Token URI (metadata location) */
  tokenURI: string;
  /** Optional per-token royalty */
  royalty?: {
    bps: number;
    receiver: Address;
  };
  /** Amount to mint (ERC1155 only) */
  amount?: number;
}

/**
 * Result of minting operation
 */
export interface MintResult {
  /** Token ID(s) minted */
  tokenIds: bigint[];
  /** Transaction hash */
  transactionHash: Hash;
  /** Transaction receipt */
  receipt: TransactionReceipt;
}

/**
 * Options for bulk minting
 */
export interface BulkMintOptions {
  /** Contract address to mint from */
  contractAddress: Address;
  /** Array of tokens to mint */
  tokens: Array<{
    to: Address;
    tokenURI: string;
    royalty?: { bps: number; receiver: Address };
  }>;
  /** Batch size for chunking */
  batchSize?: number;
  /** Progress callback */
  onProgress?: (minted: number, total: number) => void;
  /** Batch completion callback */
  onBatchComplete?: (batch: number, totalBatches: number) => void;
}

/**
 * Result of bulk minting operation
 */
export interface BulkMintResult {
  /** Total tokens minted */
  totalMinted: number;
  /** Token IDs minted */
  tokenIds: bigint[];
  /** Transaction hashes */
  transactionHashes: Hash[];
  /** Any failed mints */
  failures?: Array<{ index: number; error: Error }>;
}

/**
 * NFT metadata following ERC721 standard
 */
export interface NFTMetadata {
  /** Token name */
  name: string;
  /** Token description */
  description: string;
  /** Image URL */
  image: string;
  /** Optional attributes/traits */
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  /** Optional external URL */
  external_url?: string;
  /** Optional background color */
  background_color?: string;
  /** Optional animation URL */
  animation_url?: string;
}

/**
 * Contract type
 */
export type ContractType = 'ERC721' | 'ERC1155';

/**
 * Deployment state
 */
export type DeploymentState = 'idle' | 'deploying' | 'success' | 'error';

/**
 * Minting state
 */
export type MintingState = 'idle' | 'preparing' | 'minting' | 'success' | 'error';
