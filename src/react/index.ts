/**
 * React Hooks for Creator Core SDK
 * 
 * This module provides fully-typed React hooks for interacting with NFT Creator contracts.
 * All hooks leverage wagmi for Web3 integration and provide comprehensive TypeScript types.
 * 
 * @module @cryptoart/creator-core-sdk/react
 */

// Deployment hooks
export {
  useDeployERC721,
  type UseDeployERC721Return,
  type DeployERC721Config,
  type DeploymentStatus,
  type DeploymentError,
} from './useDeployERC721';

export {
  useDeployERC1155,
  type UseDeployERC1155Return,
  type DeployERC1155Config,
} from './useDeployERC1155';

// Minting hooks
export {
  useMintNFT,
  type UseMintNFTReturn,
  type MintNFTConfig,
  type MintStatus,
  type MintError,
} from './useMintNFT';

export {
  useBatchMint,
  type UseBatchMintReturn,
  type BatchMintConfig,
  type BatchMintStatus,
  type BatchMintError,
  type BatchMintProgress,
} from './useBatchMint';

// Contract reading hooks
export {
  useCreatorContract,
  useTokenURI,
  useBalanceOf,
  useOwnerOf,
  type UseCreatorContractReturn,
  type CreatorContractConfig,
  type ContractMetadata,
  type TokenOwnership,
} from './useCreatorContract';
