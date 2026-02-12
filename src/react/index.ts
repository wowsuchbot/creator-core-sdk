/**
 * React hooks for Creator Core SDK
 */

// Deployment hooks
export { useDeployERC721 } from './useDeployERC721';
export { useDeployERC721WithMetadata } from './useDeployERC721WithMetadata';
export type {
  DeployERC721Config,
  DeploymentStatus,
  DeploymentError,
  UseDeployERC721Return,
} from './useDeployERC721';
export type {
  DeployERC721WithMetadataConfig,
  UseDeployERC721WithMetadataReturn,
} from './useDeployERC721WithMetadata';

// Minting hooks
export { useMintNFT } from './useMintNFT';
export { useBatchMint } from './useBatchMint';
export type {
  MintNFTConfig,
  MintStatus,
  MintError,
  UseMintNFTReturn,
} from './useMintNFT';
export type {
  BatchMintConfig,
  BatchMintStatus,
  UseBatchMintReturn,
} from './useBatchMint';

// Metadata hooks
export { useMetadataBuilder } from './metadata/useMetadataBuilder';
export { useUploadMetadata } from './metadata/useUploadMetadata';
export { useBatchUpload } from './metadata/useBatchUpload';

export type {
  UseMetadataBuilderOptions,
  UseMetadataBuilderReturn,
} from './metadata/useMetadataBuilder';

export type {
  UploadStatus,
  UseUploadMetadataOptions,
  UseUploadMetadataReturn,
} from './metadata/useUploadMetadata';

export type {
  BatchUploadStatus,
  UseBatchUploadOptions,
  UseBatchUploadReturn,
} from './metadata/useBatchUpload';
