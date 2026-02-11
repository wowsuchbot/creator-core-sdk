# Creator Core SDK

> TypeScript SDK for deploying and managing NFT collections using Creator Core contracts.

[![npm version](https://img.shields.io/npm/v/@cryptoart/creator-core-sdk)](https://www.npmjs.com/package/@cryptoart/creator-core-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## Overview

Creator Core SDK simplifies the deployment and management of NFT collections using [Manifold Creator Core](https://docs.manifold.xyz/) contracts. It provides a type-safe, modern TypeScript API for:

- 🚀 **Easy Deployment** - Deploy ERC721/ERC1155 contracts in a few lines of code
- 🎨 **Bulk Minting** - Mint hundreds of NFTs efficiently with automatic batching
- 📦 **Metadata Management** - Seamless IPFS/Arweave integration for metadata
- ⛽ **Gas Optimization** - Automatic batch sizing and gas estimation
- ⚛️ **React Integration** - Optional hooks for React applications
- 🔗 **LSSVM Ready** - Built-in support for liquidity pool creation

## Project Planning

![Status: Planning](https://img.shields.io/badge/Status-Planning-yellow)

This project is currently in the planning phase. Comprehensive documentation has been prepared to guide development:

- **[Technical Requirements](./docs/REQUIREMENTS.md)** - Detailed technical specifications, contract support, and feature requirements
- **[Task Breakdown](./docs/TASK_BREAKDOWN.md)** - Phase-by-phase implementation plan with actionable tasks

These documents serve as the blueprint for building this SDK, with clear milestones and success criteria for each development phase.

## Quick Start

```bash
npm install @cryptoart/creator-core-sdk viem
```

```typescript
import { deployERC721Creator, bulkMint } from '@cryptoart/creator-core-sdk';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

// Deploy a new NFT collection
const { contractAddress } = await deployERC721Creator(
  {
    name: 'My Collection',
    symbol: 'MYCOL',
    royaltyBps: 500, // 5%
  },
  walletClient
);

// Bulk mint 100 NFTs
const result = await bulkMint(
  {
    contractAddress,
    tokens: tokenMetadata, // Array of 100 token URIs
    batchSize: 20,
    onProgress: (minted, total) => {
      console.log(`Minted ${minted}/${total}`);
    },
  },
  walletClient
);
```

## Features

### Contract Deployment

- Deploy ERC721 or ERC1155 Creator contracts
- Support for upgradeable and enumerable variants
- Configurable royalties (EIP-2981)
- Gas estimation before deployment

### Minting

- Single token minting
- Bulk minting with automatic batching
- Progress tracking for large collections
- Per-token royalty configuration
- Retry logic for failed transactions

### Metadata

- IPFS upload via Pinata or NFT.Storage
- Arweave upload support
- Metadata generation helpers
- Batch upload optimization

### React Hooks

```typescript
import { useDeployContract, useBulkMint } from '@cryptoart/creator-core-sdk/react';

function DeployNFT() {
  const { deploy, state, result } = useDeployContract();
  
  return (
    <button onClick={() => deploy({ name: 'My NFT', symbol: 'NFT' })}>
      {state === 'deploying' ? 'Deploying...' : 'Deploy Contract'}
    </button>
  );
}
```

## Documentation

- [Getting Started Guide](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./examples/)
- [Recipes](./docs/recipes.md)

## Use Cases

### 1. Bulk NFT Collection for LSSVM

```typescript
// Create 100 NFTs for a liquidity pool
const { contractAddress } = await deployERC721Creator({...});

const tokens = generateTokenMetadata(100); // Your custom logic
const { tokenIds } = await bulkMint({
  contractAddress,
  tokens,
  batchSize: 20,
}, walletClient);

// Now create LSSVM Pango pool with these NFTs
```

### 2. CryptoArt Studio Integration

```typescript
import { useDeployContract, useBulkMint } from '@cryptoart/creator-core-sdk';

// Use in Next.js app
function CreateCollection() {
  const { deploy, isDeploying, result } = useDeployContract();
  const { mint, progress } = useBulkMint();

  return (
    <div>
      <button onClick={() => deploy({...})}>Create Collection</button>
      {result && (
        <button onClick={() => mint(result.contractAddress, tokens)}>
          Mint Collection
        </button>
      )}
    </div>
  );
}
```

### 3. Custom Minting Workflow

```typescript
// Custom progress tracking and error handling
await bulkMint(
  {
    contractAddress,
    tokens,
    batchSize: 20,
    onProgress: (minted, total, batch) => {
      console.log(`Batch ${batch}: ${minted}/${total}`);
      updateProgressBar(minted / total * 100);
    },
    onError: (error, batch) => {
      logError(`Batch ${batch} failed`, error);
      // Optionally retry or continue
    },
  },
  walletClient
);
```

## Roadmap

- [ ] Phase 1: Core Functionality (ERC721/ERC1155 deployment & minting)
- [ ] Phase 2: Metadata Management (IPFS/Arweave)
- [ ] Phase 3: React Hooks (useDeployContract, useBulkMint)
- [ ] Phase 4: LSSVM support (bulk transfer utilities)
- [ ] Phase 5: Advanced Features (gas optimization, retry logic)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a PR.

## License

MIT © 2026 CryptoArt Studio
