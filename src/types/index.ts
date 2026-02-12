import type { Address, Hash, Hex } from 'viem';

export type ChainId = number;

export interface CreatorConfig {
  name: string;
  symbol: string;
}

export interface DeploymentResult {
  contractAddress: Address;
  transactionHash: Hash;
  blockNumber: bigint;
}

export interface MintResult {
  tokenId: bigint;
  transactionHash: Hash;
}

export interface MintBatchResult {
  tokenIds: bigint[];
  transactionHash: Hash;
}

export interface ContractAddresses {
  erc721CreatorFactory: Address;
}

export interface SDKConfig {
  chainId?: ChainId;
  factoryAddress?: Address;
}

export { Address, Hash, Hex };
