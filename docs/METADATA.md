# Metadata Management Guide

Comprehensive guide for creating, validating, and uploading NFT metadata using the Creator Core SDK.

## Table of Contents

- [Quick Start](#quick-start)
- [MetadataBuilder API](#metadatabuilder-api)
- [IPFS Upload](#ipfs-upload)
- [React Hooks](#react-hooks)
- [Batch Operations](#batch-operations)
- [Integration Examples](#integration-examples)
- [Best Practices](#best-practices)
- [Type Reference](#type-reference)

## Quick Start

### Building Metadata

```typescript
import { MetadataBuilder } from '@cryptoart/creator-core-sdk';

const metadata = new MetadataBuilder()
  .setName('Cool NFT #1')
  .setDescription('A very cool NFT from my collection')
  .setImage('ipfs://QmYourImageHash')
  .addAttribute('Rarity', 'Legendary')
  .addAttribute('Power', 100, 'number')
  .build();
```

### Uploading to IPFS

```typescript
import { uploadMetadata } from '@cryptoart/creator-core-sdk';

const result = await uploadMetadata(metadata);
console.log('Metadata URL:', result.url); // ipfs://QmMetadataHash
console.log('Gateway URL:', result.gatewayUrl); // https://nft.storage/ipfs/QmMetadataHash
```

### Using React Hooks

```tsx
import { useMetadataBuilder, useUploadMetadata } from '@cryptoart/creator-core-sdk/react';

function CreateNFT() {
  const { builder, build, isValid } = useMetadataBuilder({
    template: 'pfp',
    name: 'Cool PFP #1',
    imageUri: 'ipfs://QmImage123'
  });

  const { upload, isUploading, result } = useUploadMetadata();

  const handleMint = async () => {
    if (!isValid) return;
    
    const metadata = build();
    const uploadResult = await upload(metadata);
    
    if (uploadResult) {
      console.log('Token URI:', uploadResult.url);
      // Use uploadResult.url as tokenURI in mint transaction
    }
  };

  return (
    <button onClick={handleMint} disabled={!isValid || isUploading}>
      {isUploading ? 'Uploading...' : 'Create NFT'}
    </button>
  );
}
```

## MetadataBuilder API

### Core Methods

#### `setName(name: string)`
Set the NFT name (required).

```typescript
builder.setName('My Awesome NFT');
```

#### `setDescription(description: string)`
Set the NFT description (required).

```typescript
builder.setDescription('This NFT represents...');
```

#### `setImage(uri: string)`
Set the image URI (required). Accepts: `ipfs://`, `https://`, `http://`, `data:`, `ar://`

```typescript
builder.setImage('ipfs://QmYourImageHash');
```

#### `addAttribute(trait_type: string, value: string | number, display_type?: string, max_value?: number)`
Add a metadata attribute/trait.

```typescript
// Simple attribute
builder.addAttribute('Background', 'Blue');

// Numeric attribute
builder.addAttribute('Power', 85, 'number');

// Boost percentage
builder.addAttribute('Speed Boost', 10, 'boost_percentage', 100);

// Date attribute (Unix timestamp)
builder.addAttribute('Birthday', 1640000000, 'date');
```

### Optional Fields

#### `setExternalUrl(url: string)`
Link to external website or platform.

```typescript
builder.setExternalUrl('https://myproject.com/nft/1');
```

#### `setAnimationUrl(uri: string)`
URI for animation, video, or audio content.

```typescript
builder.setAnimationUrl('ipfs://QmVideoHash');
```

#### `setBackgroundColor(color: string)`
Background color as 6-character hex (without #).

```typescript
builder.setBackgroundColor('FF0000'); // Red background
```

#### `setYoutubeUrl(url: string)`
YouTube video URL.

```typescript
builder.setYoutubeUrl('https://youtube.com/watch?v=...');
```

### ERC1155 Support

#### `asERC1155(decimals?: number)`
Enable ERC1155 mode with optional decimals.

```typescript
builder.asERC1155(18); // For fungible tokens
```

#### `setProperties(properties: Record<string, unknown>)`
Set custom properties for ERC1155.

```typescript
builder.setProperties({
  supply: 1000,
  category: 'gaming'
});
```

### Validation

#### `validate()`
Validate current metadata state.

```typescript
const validation = builder.validate();
if (!validation.valid) {
  console.error('Errors:', validation.errors);
}
```

#### `build()`
Build final metadata (throws if invalid).

```typescript
try {
  const metadata = builder.build();
} catch (error) {
  console.error('Build failed:', error.message);
}
```

### Templates

Pre-configured metadata builders for common NFT types.

#### Generic
```typescript
const builder = MetadataBuilder.createGeneric(
  'My NFT',
  'Description',
  'ipfs://QmImage'
);
```

#### PFP (Profile Picture)
```typescript
const builder = MetadataBuilder.createPFP(
  'Cool Avatar #1',
  'ipfs://QmImage'
);
```

#### Art
```typescript
const builder = MetadataBuilder.createArt(
  'Masterpiece',
  'Artist Name',
  'A beautiful digital artwork',
  'ipfs://QmImage'
);
```

#### Gaming
```typescript
const builder = MetadataBuilder.createGaming(
  'Sword of Power',
  'Legendary weapon',
  'ipfs://QmImage',
  'Legendary'
);
```

#### Music
```typescript
const builder = MetadataBuilder.createMusic(
  'Song Title',
  'Artist Name',
  'ipfs://QmAudioFile',
  'ipfs://QmCoverArt'
);
```

#### From Template Type
```typescript
const builder = MetadataBuilder.fromTemplate(
  'pfp',
  'PFP #1',
  'ipfs://QmImage',
  { rarity: 'Rare' }
);
```

## IPFS Upload

### Single Upload

```typescript
import { uploadMetadata } from '@cryptoart/creator-core-sdk';

const result = await uploadMetadata(metadata, {
  gateway: 'https://nft.storage',
  timeout: 30000,
  retries: 3
});

console.log('IPFS URL:', result.url);
console.log('Hash:', result.hash);
console.log('Gateway URL:', result.gatewayUrl);
```

### Batch Upload

```typescript
import { uploadMetadataBatch } from '@cryptoart/creator-core-sdk';

const metadataArray = Array.from({ length: 100 }, (_, i) => ({
  name: `NFT #${i}`,
  description: `NFT number ${i}`,
  image: `ipfs://QmImage${i}`
}));

const result = await uploadMetadataBatch(
  metadataArray,
  (progress) => {
    console.log(`Progress: ${progress.successful}/${progress.total}`);
  },
  { timeout: 60000 }
);

if (result.success) {
  console.log('All uploaded!');
  result.results.forEach((item, i) => {
    if (item.success) {
      console.log(`#${i}: ${item.response?.url}`);
    }
  });
}
```

### IPFSClient Class

For more control, use the `IPFSClient` class directly.

```typescript
import { IPFSClient } from '@cryptoart/creator-core-sdk';

const client = new IPFSClient({
  gateway: 'https://nft.storage',
  timeout: 30000,
  retries: 3,
  pin: true
});

// Single upload
const result = await client.uploadJSON(metadata);

// Batch upload
const batchResult = await client.uploadBatch(
  metadataArray,
  (progress) => console.log(progress),
  5 // concurrency
);

// Clean up
client.disconnect();
```

## React Hooks

### useMetadataBuilder

Build metadata with real-time validation.

```tsx
import { useMetadataBuilder } from '@cryptoart/creator-core-sdk/react';

function MetadataForm() {
  const { builder, validate, build, isValid, errors } = useMetadataBuilder({
    template: 'generic',
    name: 'Initial Name',
    imageUri: 'ipfs://QmImage'
  });

  const handleAddAttribute = () => {
    builder.addAttribute('Rarity', 'Common');
    validate();
  };

  return (
    <div>
      <p>Valid: {isValid ? 'Yes' : 'No'}</p>
      {errors.map(err => (
        <p key={err.field}>{err.field}: {err.message}</p>
      ))}
      <button onClick={handleAddAttribute}>Add Attribute</button>
    </div>
  );
}
```

### useUploadMetadata

Upload single metadata to IPFS.

```tsx
import { useUploadMetadata } from '@cryptoart/creator-core-sdk/react';

function UploadButton() {
  const { upload, status, result, error, isUploading } = useUploadMetadata({
    onSuccess: (result) => console.log('Uploaded:', result.url),
    onError: (error) => console.error('Failed:', error)
  });

  const handleUpload = async () => {
    const metadata = {
      name: 'My NFT',
      description: 'Cool NFT',
      image: 'ipfs://QmImage'
    };
    
    await upload(metadata);
  };

  return (
    <div>
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      {result && <p>URL: {result.url}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### useBatchUpload

Upload multiple metadata with progress tracking.

```tsx
import { useBatchUpload } from '@cryptoart/creator-core-sdk/react';

function BatchUploader() {
  const { uploadBatch, progress, isUploading, results } = useBatchUpload({
    concurrency: 5,
    onProgress: (progress) => {
      console.log(`${progress.successful}/${progress.total} completed`);
    }
  });

  const handleBatchUpload = async () => {
    const metadataArray = Array.from({ length: 100 }, (_, i) => ({
      name: `NFT #${i}`,
      description: `Number ${i}`,
      image: `ipfs://QmImage${i}`
    }));
    
    await uploadBatch(metadataArray);
  };

  return (
    <div>
      <button onClick={handleBatchUpload} disabled={isUploading}>
        Upload 100 NFTs
      </button>
      {progress && (
        <div>
          <p>Progress: {progress.successful}/{progress.total}</p>
          <p>Failed: {progress.failed}</p>
          <p>In Progress: {progress.inProgress}</p>
        </div>
      )}
    </div>
  );
}
```

## Batch Operations

### LSSVM Pool Example (100 NFTs)

```typescript
import { MetadataBuilder, uploadMetadataBatch } from '@cryptoart/creator-core-sdk';

// Generate 100 metadata objects
const metadataArray = Array.from({ length: 100 }, (_, i) => {
  return new MetadataBuilder()
    .setName(`Pool NFT #${i}`)
    .setDescription(`NFT #${i} for LSSVM pool`)
    .setImage(`ipfs://QmCollection/${i}.png`)
    .addAttribute('Number', i, 'number')
    .addAttribute('Rarity', i < 10 ? 'Rare' : 'Common')
    .build();
});

// Upload with progress tracking
const result = await uploadMetadataBatch(
  metadataArray,
  (progress) => {
    const percent = (progress.successful / progress.total) * 100;
    console.log(`${percent.toFixed(1)}% complete`);
  }
);

// Extract URIs for minting
const tokenURIs = result.results
  .filter(r => r.success)
  .map(r => r.response!.url);

console.log('Token URIs:', tokenURIs);
```

### Retry Failed Uploads

```typescript
const result = await uploadMetadataBatch(metadataArray);

if (result.progress.failed > 0) {
  console.log(`${result.progress.failed} failed, retrying...`);
  
  const failedIndices = result.results
    .filter(r => !r.success)
    .map(r => r.index);
  
  const failedMetadata = failedIndices.map(i => metadataArray[i]);
  
  const retryResult = await uploadMetadataBatch(failedMetadata);
  console.log('Retry complete:', retryResult.progress);
}
```

## Integration Examples

### Complete Minting Flow

```tsx
import { 
  useMetadataBuilder, 
  useUploadMetadata, 
  useDeployERC721WithMetadata 
} from '@cryptoart/creator-core-sdk/react';

function MintNFT() {
  const { builder, build, isValid } = useMetadataBuilder({
    template: 'art',
    name: 'My Artwork',
    imageUri: 'ipfs://QmImage',
    templateOptions: {
      artist: 'John Doe',
      description: 'Beautiful digital art'
    }
  });

  const { upload: uploadMetadata, result: metadataResult } = useUploadMetadata();
  const { deploy } = useDeployERC721WithMetadata();

  const handleMint = async () => {
    // 1. Build and validate metadata
    if (!isValid) return;
    const metadata = build();

    // 2. Upload metadata to IPFS
    const uploadResult = await uploadMetadata(metadata);
    if (!uploadResult) return;

    // 3. Deploy contract with base URI
    const deployment = await deploy({
      name: 'My Collection',
      symbol: 'ART',
      factoryAddress: '0x...',
      baseURI: 'ipfs://QmCollection/' // If using sequential IDs
    });

    console.log('Contract deployed:', deployment.contractAddress);
    console.log('Token URI:', uploadResult.url);
  };

  return <button onClick={handleMint}>Mint NFT</button>;
}
```

### Batch Mint with Metadata

```typescript
import { MetadataBuilder, uploadMetadataBatch } from '@cryptoart/creator-core-sdk';
import { useBatchMint } from '@cryptoart/creator-core-sdk/react';

async function batchMintWithMetadata() {
  // 1. Generate metadata
  const metadataArray = Array.from({ length: 50 }, (_, i) => 
    new MetadataBuilder()
      .setName(`NFT #${i}`)
      .setDescription(`Description ${i}`)
      .setImage(`ipfs://QmImages/${i}`)
      .build()
  );

  // 2. Upload all metadata
  const uploadResult = await uploadMetadataBatch(metadataArray);
  
  if (!uploadResult.success) {
    console.error('Some uploads failed:', uploadResult.progress);
    return;
  }

  // 3. Extract token URIs
  const tokenURIs = uploadResult.results.map(r => r.response!.url);

  // 4. Batch mint with URIs
  const { batchMint } = useBatchMint();
  await batchMint({
    contractAddress: '0x...',
    recipients: Array(50).fill('0xRecipient'),
    tokenURIs // Pass the IPFS URLs
  });
}
```

## Best Practices

### 1. Image Upload First
Always upload images to IPFS before creating metadata.

```typescript
// Upload image first
const imageResult = await uploadImageToIPFS(imageFile);

// Then create metadata
const metadata = new MetadataBuilder()
  .setName('My NFT')
  .setDescription('...')
  .setImage(imageResult.url) // Use IPFS URL
  .build();
```

### 2. Validate Before Upload
```typescript
const validation = builder.validate();
if (!validation.valid) {
  console.error('Fix these errors:', validation.errors);
  return;
}

const metadata = builder.build();
const result = await uploadMetadata(metadata);
```

### 3. Handle Upload Failures
```typescript
try {
  const result = await uploadMetadata(metadata);
  console.log('Success:', result.url);
} catch (error) {
  if (error instanceof IPFSError) {
    console.error('IPFS Error:', error.code, error.message);
    // Handle specific error codes
    if (error.code === 'TIMEOUT') {
      // Retry logic
    }
  }
}
```

### 4. Use Batch Operations for Collections
For collections with 10+ NFTs, use batch upload.

```typescript
// Good: Batch upload
const result = await uploadMetadataBatch(metadataArray, undefined, 5);

// Avoid: Sequential uploads
for (const metadata of metadataArray) {
  await uploadMetadata(metadata); // Slow!
}
```

### 5. Progress Feedback
Always show progress for batch operations.

```typescript
const result = await uploadMetadataBatch(
  metadataArray,
  (progress) => {
    const percent = (progress.successful / progress.total) * 100;
    updateUI(`${percent.toFixed(0)}% complete`);
  }
);
```

### 6. Store Metadata Locally
Keep a local copy of metadata for recovery.

```typescript
const metadata = builder.build();

// Save locally
localStorage.setItem('nft-metadata', JSON.stringify(metadata));

// Upload
const result = await uploadMetadata(metadata);
```

### 7. Use Templates
Start with templates for consistent metadata.

```typescript
// Good: Template
const builder = MetadataBuilder.createPFP(name, imageUri);

// Then customize
builder.addAttribute('Rarity', 'Legendary');
```

## Type Reference

### ERC721Metadata
```typescript
interface ERC721Metadata {
  name: string;
  description: string;
  image: string;
  attributes?: MetadataAttribute[];
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  youtube_url?: string;
}
```

### MetadataAttribute
```typescript
interface MetadataAttribute {
  trait_type: string;
  value: string | number;
  display_type?: DisplayType;
  max_value?: number;
}
```

### IPFSUploadResponse
```typescript
interface IPFSUploadResponse {
  url: string;        // ipfs://QmHash
  hash: string;       // QmHash
  gatewayUrl: string; // https://nft.storage/ipfs/QmHash
}
```

### BatchUploadProgress
```typescript
interface BatchUploadProgress {
  inProgress: number;
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}
```

### IPFSUploadOptions
```typescript
interface IPFSUploadOptions {
  gateway?: string;  // Default: 'https://nft.storage'
  timeout?: number;  // Default: 30000
  retries?: number;  // Default: 3
  pin?: boolean;     // Default: true
}
```

## Error Handling

### IPFSError Codes
- `UPLOAD_FAILED`: Upload failed after retries
- `TIMEOUT`: Upload timed out
- `INVALID_RESPONSE`: Invalid response from IPFS
- `NETWORK_ERROR`: Network connectivity issue

### Example Error Handling
```typescript
try {
  const result = await uploadMetadata(metadata);
} catch (error) {
  if (error instanceof IPFSError) {
    switch (error.code) {
      case 'TIMEOUT':
        console.error('Upload timed out, please try again');
        break;
      case 'NETWORK_ERROR':
        console.error('Network error, check your connection');
        break;
      case 'UPLOAD_FAILED':
        console.error('Upload failed:', error.message);
        break;
    }
  }
}
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/wowsuchbot/creator-core-sdk/issues
- Documentation: https://github.com/wowsuchbot/creator-core-sdk#readme
