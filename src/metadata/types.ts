/**
 * Type definitions for NFT metadata and IPFS storage
 * Compliant with ERC721 and ERC1155 metadata standards
 */

/**
 * Display type for metadata attributes
 * Controls how marketplaces render attribute values
 */
export type DisplayType =
  | 'number'
  | 'boost_number'
  | 'boost_percentage'
  | 'date'
  | string;

/**
 * Individual metadata attribute following OpenSea standard
 * @see https://docs.opensea.io/docs/metadata-standards
 */
export interface MetadataAttribute {
  /** The name/type of the trait (e.g., "Background", "Eyes") */
  trait_type: string;
  /** The value of the trait (can be string or number) */
  value: string | number;
  /** Optional display type hint for marketplaces */
  display_type?: DisplayType;
  /** Optional max value for numeric traits */
  max_value?: number;
}

/**
 * ERC721 NFT metadata standard
 * @see https://eips.ethereum.org/EIPS/eip-721
 */
export interface ERC721Metadata {
  /** Name of the NFT */
  name: string;
  /** Description of the NFT */
  description: string;
  /** URI to the NFT image (IPFS, HTTP, or data URI) */
  image: string;
  /** Optional array of attributes/traits */
  attributes?: MetadataAttribute[];
  /** Optional external URL for more information */
  external_url?: string;
  /** Optional animation/video URI */
  animation_url?: string;
  /** Optional background color (6-character hex without #) */
  background_color?: string;
  /** Optional YouTube video URL */
  youtube_url?: string;
}

/**
 * ERC1155 NFT metadata standard (extends ERC721)
 * @see https://eips.ethereum.org/EIPS/eip-1155
 */
export interface ERC1155Metadata extends ERC721Metadata {
  /** Optional decimals for fungible tokens (default 0 for NFTs) */
  decimals?: number;
  /** Optional properties object for additional metadata */
  properties?: Record<string, unknown>;
}

/**
 * Generic NFT metadata type (union of ERC721 and ERC1155)
 */
export type NFTMetadata = ERC721Metadata | ERC1155Metadata;

/**
 * IPFS upload response containing URLs and hash
 */
export interface IPFSUploadResponse {
  /** IPFS protocol URL (ipfs://...) */
  url: string;
  /** IPFS content hash (CID) */
  hash: string;
  /** HTTP gateway URL for browser access */
  gatewayUrl: string;
}

/**
 * Configuration options for IPFS uploads
 */
export interface IPFSUploadOptions {
  /** IPFS gateway URL (default: nft.storage gateway) */
  gateway?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts on failure (default: 3) */
  retries?: number;
  /** Whether to pin content (default: true) */
  pin?: boolean;
}

/**
 * Progress tracking for batch uploads
 */
export interface BatchUploadProgress {
  /** Current number of uploads in progress */
  inProgress: number;
  /** Total number of items to upload */
  total: number;
  /** Number of successfully completed uploads */
  successful: number;
  /** Number of failed uploads */
  failed: number;
  /** Array of error messages for failed uploads */
  errors: string[];
}

/**
 * Result from a single item in batch upload
 */
export interface BatchUploadResult {
  /** Index of the item in the original batch */
  index: number;
  /** Success status */
  success: boolean;
  /** IPFS response if successful */
  response?: IPFSUploadResponse;
  /** Error message if failed */
  error?: string;
}

/**
 * Complete batch upload response
 */
export interface BatchUploadResponse {
  /** Array of individual upload results */
  results: BatchUploadResult[];
  /** Overall success status (true if all succeeded) */
  success: boolean;
  /** Final progress snapshot */
  progress: BatchUploadProgress;
}

/**
 * Metadata validation error
 */
export interface MetadataValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Validation rule that failed */
  rule: 'required' | 'format' | 'type' | 'length';
}

/**
 * Result of metadata validation
 */
export interface MetadataValidationResult {
  /** Whether metadata is valid */
  valid: boolean;
  /** Array of validation errors (empty if valid) */
  errors: MetadataValidationError[];
}

/**
 * Collection-level metadata
 */
export interface CollectionMetadata {
  /** Collection name */
  name: string;
  /** Collection description */
  description: string;
  /** Collection image URI */
  image: string;
  /** Optional external link */
  external_link?: string;
  /** Optional seller fee basis points (e.g., 250 = 2.5%) */
  seller_fee_basis_points?: number;
  /** Optional fee recipient address */
  fee_recipient?: string;
}

/**
 * Template type for pre-configured metadata builders
 */
export type MetadataTemplate = 'generic' | 'pfp' | 'art' | 'gaming' | 'music';

/**
 * Storage provider type
 */
export type StorageProvider = 'ipfs' | 'arweave';

/**
 * Error thrown during IPFS operations
 */
export class IPFSError extends Error {
  constructor(
    message: string,
    public readonly code: 'UPLOAD_FAILED' | 'TIMEOUT' | 'INVALID_RESPONSE' | 'NETWORK_ERROR',
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'IPFSError';
  }
}

/**
 * Error thrown during metadata validation
 */
export class MetadataValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: MetadataValidationError[]
  ) {
    super(message);
    this.name = 'MetadataValidationError';
  }
}
