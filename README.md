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

### 1. Bulk NFT Collection + LSSVM Pool

Deploy a 100-NFT collection and create a liquidity pool in just 2 clicks:

```typescript
import { deployAndMintCollection } from '@cryptoart/creator-core-sdk';
import { createPool } from '@lssvm/sdk';

// Deploy and mint 100 NFTs
const { contractAddress, tokenIds } = await deployAndMintCollection({
  name: 'Pool Collection',
  symbol: 'POOL',
  tokenCount: 100,
  metadata: generatedMetadata,
});

// Create LSSVM pool
const pool = await createPool({
  nftAddress: contractAddress,
  tokenIds,
  // ... pool config
});
```

### 2. Marketplace Integration

Integrate Creator Core tools into your marketplace:

```typescript
import { useDeployContract, useBulkMint } from '@cryptoart/creator-core-sdk/react';

// Component with full creator workflow
function CreatorStudio() {
  // Deploy contract, upload metadata, mint tokens, list on marketplace
}
```

### 3. Generative Art Drops

Mint generative art collections efficiently:

```typescript
import { prepareMetadata, bulkMint } from '@cryptoart/creator-core-sdk';

// Generate art and metadata
const metadata = await generateArt(100);

// Upload to IPFS and mint
const tokenURIs = await prepareMetadata(metadata);
const result = await bulkMint({ tokenURIs, batchSize: 25 });
```

## Architecture

```
creator-core-sdk/
├── src/
│   ├── contracts/      # Contract deployment and interactions
│   ├── metadata/       # IPFS/Arweave upload and generation
│   ├── hooks/          # React hooks (optional)
│   ├── utils/          # Gas estimation, batching, errors
│   └── types/          # TypeScript definitions
├── abis/               # Contract ABIs
├── test/               # Comprehensive test suite
├── examples/           # Usage examples
└── docs/               # Documentation
```

## Requirements

- Node.js 18+
- TypeScript 5.0+
- viem ^2.x

## Related Projects

- [cryptoart-studio](https://github.com/wowsuchbot/cryptoart-studio) - NFT marketplace monorepo
- [such-lssvm](https://github.com/mxjxn/such-lssvm) - LSSVM liquidity pool tools
- [creator-core-solidity](https://github.com/mxjxn/creator-core-solidity) - Creator Core smart contracts

## Development

```bash
# Clone repository
git clone https://github.com/wowsuchbot/creator-core-sdk.git
cd creator-core-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build package
npm run build

# Run examples
npm run example:deploy
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- [GitHub Issues](https://github.com/wowsuchbot/creator-core-sdk/issues)
- [Documentation](./docs/)
- [Examples](./examples/)

## Roadmap

- [x] Core contract deployment
- [x] Bulk minting with batching
- [x] IPFS metadata upload
- [ ] Arweave integration
- [ ] Extension management
- [ ] Cross-chain support
- [ ] Gasless minting (meta-transactions)
- [ ] Advanced royalty splitting

---

**Built with ❤️ for the NFT creator community**
