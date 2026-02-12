// Main SDK class
export { CreatorCoreSDK } from './CreatorCoreSDK';

// Client classes
export { ERC721Creator } from './clients/ERC721Creator';

// Core Types
export type {
  Address,
  Hash,
  Hex,
  ChainId,
  CreatorConfig,
  DeploymentResult,
  MintResult,
  MintBatchResult,
  ContractAddresses,
  SDKConfig,
} from './types';

// Metadata Types
export type {
  DisplayType,
  MetadataAttribute,
  ERC721Metadata,
  ERC1155Metadata,
  NFTMetadata,
  IPFSUploadResponse,
  IPFSUploadOptions,
  BatchUploadProgress,
  BatchUploadResult,
  BatchUploadResponse,
  MetadataValidationError,
  MetadataValidationResult,
  CollectionMetadata,
  MetadataTemplate,
  StorageProvider,
} from './metadata/types';

// Metadata Errors
export { IPFSError, MetadataValidationError } from './metadata/types';

// Metadata Builder
export { MetadataBuilder, validateMetadata } from './metadata/builder';

// IPFS Client
export {
  IPFSClient,
  createIPFSClient,
  uploadMetadata,
  uploadMetadataBatch,
} from './storage/ipfs';

// Constants
export { CHAIN_IDS, CONTRACT_ADDRESSES, getContractAddresses } from './constants';

// ABIs
export { default as ERC721CreatorABI } from '../abis/ERC721Creator.json';
export { default as ERC721CreatorFactoryABI } from '../abis/ERC721CreatorFactory.json';
