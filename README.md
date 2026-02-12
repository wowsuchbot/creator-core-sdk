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
- ⚡ **Gas Optimization** - Automatic batch sizing and gas estimation
- ⚛️ **React Integration** - Optional hooks for React applications
- 🔗 **LSSVM Ready** - Built-in support for liquidity pool creation

## Project Status

![Status: Phase 1 Complete](https://img.shields.io/badge/Status-Phase%201%20Complete-green)

**Phase 1 - Core Infrastructure: ✅ COMPLETE**

The foundational infrastructure and core deployment functionality is now complete:

- ✅ TypeScript project setup with tsup bundler
- ✅ Dual module exports (ESM + CJS)
- ✅ Vitest testing framework configured
- ✅ ESLint and Prettier for code quality
- ✅ Creator Core contract ABIs integrated
- ✅ Core SDK structure with contract clients
- ✅ Basic ERC721 deployment functionality
- ✅ Comprehensive test coverage
- ✅ GitHub Actions CI/CD pipeline

### Documentation

- **[Technical Requirements](./docs/REQUIREMENTS.md)** - Detailed technical specifications, contract support, and feature requirements
- **[Task Breakdown](./docs/TASK_BREAKDOWN.md)** - Phase-by-phase implementation plan with actionable tasks

## Installation

```bash
npm install @cryptoart/creator-core-sdk viem
```

## Quick Start

```typescript
import { CreatorCoreSDK } from '@cryptoart/creator-core-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Set up clients
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const account = privateKeyToAccount('0x...');
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(),
});

// Initialize SDK
const sdk = new CreatorCoreSDK(publicClient, walletClient);

// Deploy a new NFT collection
const deployment = await sdk.deployERC721({
  name: 'My Collection',
  symbol: 'MYCOL',
});

console.log('Deployed to:', deployment.contractAddress);

// Get contract client
const creator = sdk.getERC721Creator(deployment.contractAddress);

// Mint a single NFT
const mint = await creator.mint(
  '0xRecipientAddress',
  'ipfs://QmYourTokenURI'
);

console.log('Minted token:', mint.tokenId);

// Mint multiple NFTs
const batchMint = await creator.mintBatch(
  '0xRecipientAddress',
  10 // mint 10 NFTs
);

console.log('Minted tokens:', batchMint.tokenIds);
```

## Features

### Contract Deployment

- Deploy ERC721 Creator contracts
- Support for upgradeable and enumerable variants (coming soon)
- Configurable royalties (EIP-2981) (coming soon)
- Gas estimation before deployment

### Minting

- Single token minting
- Bulk minting with automatic batching
- Progress tracking for large collections (coming soon)
- Per-token royalty configuration (coming soon)
- Retry logic for failed transactions (coming soon)

### Metadata

- IPFS upload via Pinata or NFT.Storage (coming soon)
- Arweave upload support (coming soon)
- Metadata generation helpers (coming soon)
- Batch upload optimization (coming soon)

### LSSVM Integration

- Create liquidity pools for collections (coming soon)
- Configure bonding curves (coming soon)
- Deposit NFTs into pools (coming soon)

## API Reference

### `CreatorCoreSDK`

The main SDK class for interacting with Creator Core contracts.

```typescript
const sdk = new CreatorCoreSDK(publicClient, walletClient, config?);
```

#### Methods

- `deployERC721(config)` - Deploy a new ERC721 Creator contract
- `getERC721Creator(address)` - Get a client for an existing contract
- `getFactoryAddress()` - Get the factory contract address
- `getChainId()` - Get the current chain ID

### `ERC721Creator`

Client for interacting with deployed ERC721 Creator contracts.

```typescript
const creator = sdk.getERC721Creator(contractAddress);
```

#### Methods

- `mint(to, uri?)` - Mint a single NFT
- `mintBatch(to, count?, uris?)` - Mint multiple NFTs
- `tokenURI(tokenId)` - Get token metadata URI
- `balanceOf(owner)` - Get token balance
- `name()` - Get collection name
- `symbol()` - Get collection symbol
- `owner()` - Get contract owner

## Development

### Setup

```bash
git clone https://github.com/wowsuchbot/creator-core-sdk.git
cd creator-core-sdk
npm install
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

### Lint

```bash
npm run lint
npm run format
```

## Roadmap

### Phase 2 - Enhanced Functionality (Planned)
- Bulk minting with progress tracking
- IPFS/Arweave metadata management
- Gas optimization strategies
- Error handling and retry logic

### Phase 3 - LSSVM Integration (Planned)
- Liquidity pool creation
- Pool configuration and management
- NFT deposits and withdrawals

### Phase 4 - Developer Experience (Planned)
- React hooks
- CLI tool
- Example applications
- Advanced documentation

## Contributing

Contributions are welcome! Please read the [contribution guidelines](./CONTRIBUTING.md) first.

## License

MIT © [CryptoArt Studio](https://github.com/wowsuchbot)

## Support

- [Documentation](./docs)
- [GitHub Issues](https://github.com/wowsuchbot/creator-core-sdk/issues)
- [Discord Community](https://discord.gg/cryptoart)

## Acknowledgments

Built on top of [Manifold Creator Core](https://docs.manifold.xyz/) contracts.
