# Creator Core SDK

> TypeScript SDK for deploying and managing NFT collections using Creator Core contracts with full type safety and React integration.

[![npm version](https://img.shields.io/npm/v/@cryptoart/creator-core-sdk)](https://www.npmjs.com/package/@cryptoart/creator-core-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Type Safety](https://img.shields.io/badge/Type%20Safety-10%2F10-brightgreen)](https://www.typescriptlang.org/)

---

## Features

Creator Core SDK provides a modern, type-safe interface for NFT deployment and management:

- 🚀 **Easy Deployment** - Deploy ERC721/ERC1155 contracts in a few lines of code
- 🎨 **Bulk Minting** - Efficiently mint hundreds of NFTs with automatic batching
- 📦 **Metadata Management** - Seamless IPFS/Arweave integration for metadata and assets
- ⚡ **Gas Optimization** - Automatic batch sizing and gas estimation
- ⚛️ **React Integration** - Optional hooks for React applications with full TypeScript support
- 🔗 **LSSVM Ready** - Built-in support for liquidity pool creation
- 💯 **10/10 Type Safety** - Comprehensive TypeScript definitions for every API surface
- 🛠️ **Developer Experience** - Intuitive API design with excellent IDE autocomplete

---

## Installation

```bash
npm install @cryptoart/creator-core-sdk viem
```

Or with Yarn:

```bash
yarn add @cryptoart/creator-core-sdk viem
```

> **Note:** This SDK uses [viem](https://viem.sh) for Ethereum interactions. Make sure to install it as a peer dependency.

---

## Quick Start

### Deploy and Mint an NFT Collection

```typescript
import { CreatorCoreSDK } from '@cryptoart/creator-core-sdk';
import { createPublicClient, createWalletClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Set up viem clients
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
const mintTx = await creator.mintBaseTo({
  to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  uri: 'ipfs://QmYourMetadataHash',
});

console.log('Minted NFT:', mintTx.hash);
```

### Bulk Minting with Automatic Batching

```typescript
import { BulkMintManager } from '@cryptoart/creator-core-sdk';

const bulkMinter = new BulkMintManager(
  publicClient,
  walletClient,
  deployment.contractAddress
);

// Mint 100 NFTs efficiently
const recipients = Array(100).fill('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
const uris = Array(100).fill(0).map((_, i) => `ipfs://QmBase/${i}`);

const result = await bulkMinter.mintBatch(recipients, uris);
console.log(`Minted ${result.totalMinted} NFTs in ${result.batches.length} batches`);
```

### React Hooks Integration

```typescript
import { useDeployERC721, useMintNFT } from '@cryptoart/creator-core-sdk/react';
import { useWalletClient, usePublicClient } from 'wagmi';

function DeployNFTCollection() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const { deploy, isDeploying, contractAddress, error } = useDeployERC721({
    publicClient,
    walletClient,
  });

  const handleDeploy = async () => {
    await deploy({
      name: 'My NFT Collection',
      symbol: 'MYNFT',
    });
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={isDeploying}>
        {isDeploying ? 'Deploying...' : 'Deploy Collection'}
      </button>
      {contractAddress && <p>Deployed: {contractAddress}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

---

## Documentation

### Core Documentation

- **[API Reference](./docs/API_REFERENCE.md)** - Complete API documentation for all exports, classes, and types
- **[SDK Developer Guide](./docs/SDK_DEVELOPER_GUIDE.md)** - Architecture, design patterns, and SDK internals
- **[Contributing Guide](./docs/CONTRIBUTING.md)** - Development setup, testing, and contribution workflow

### Integration Guides

- **[LSSVM Integration](./docs/INTEGRATION_SUCH_LSSVM.md)** - Create liquidity pools with such-lssvm
- **[CryptoArt Studio Integration](./docs/INTEGRATION_CRYPTOART_STUDIO.md)** - Integrate SDK into React applications

---

## Examples

### Deploy ERC1155 Collection

```typescript
const deployment = await sdk.deployERC1155({
  name: 'My Multi-Edition Collection',
  symbol: 'MULTI',
});

const creator = sdk.getERC1155Creator(deployment.contractAddress);
```

### Mint with Custom Extensions

```typescript
const creator = sdk.getERC721Creator(contractAddress);

await creator.mintBaseExisting({
  to: recipient,
  tokenIds: [1, 2, 3],
  uris: ['ipfs://hash1', 'ipfs://hash2', 'ipfs://hash3'],
});
```

### IPFS Metadata Upload

```typescript
import { IPFSUploader } from '@cryptoart/creator-core-sdk';

const uploader = new IPFSUploader({
  gateway: 'https://ipfs.io',
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretKey: process.env.PINATA_SECRET_KEY,
});

const metadata = {
  name: 'My NFT #1',
  description: 'A unique digital collectible',
  image: 'ipfs://QmImageHash',
  attributes: [
    { trait_type: 'Rarity', value: 'Legendary' },
  ],
};

const uri = await uploader.uploadMetadata(metadata);
console.log('Metadata URI:', uri);
```

### Create LSSVM Liquidity Pool

```typescript
import { LSSVMPoolManager } from '@cryptoart/creator-core-sdk';

const poolManager = new LSSVMPoolManager(publicClient, walletClient);

const pool = await poolManager.createPool({
  nftAddress: deployment.contractAddress,
  bondingCurve: '0x...', // Linear bonding curve address
  poolType: 'TRADE', // NFT, TOKEN, or TRADE
  delta: '1000000000000000', // 0.001 ETH price change per swap
  spotPrice: '100000000000000000', // 0.1 ETH starting price
  initialNFTIds: [1, 2, 3, 4, 5],
  initialTokenBalance: '1000000000000000000', // 1 ETH
});

console.log('Pool created:', pool.poolAddress);
```

---

## TypeScript Support

Creator Core SDK is built with TypeScript from the ground up and provides **10/10 type safety**:

- ✅ Full type definitions for all public APIs
- ✅ Strict type checking for contract interactions
- ✅ IntelliSense support in all major IDEs
- ✅ Discriminated unions for type-safe error handling
- ✅ Generic types for flexible yet safe API usage

```typescript
// TypeScript infers all types automatically
const deployment = await sdk.deployERC721({
  name: 'Collection', // ✓ Type: string
  symbol: 'COL',      // ✓ Type: string
  // unknownProp: 'value' // ✗ TypeScript error: unknown property
});

// Full autocomplete for all methods
const creator = sdk.getERC721Creator(deployment.contractAddress);
creator.mintBaseTo({ /* IDE autocomplete shows all parameters */ });
```

---

## React Hooks

The SDK provides a comprehensive set of React hooks for seamless integration:

### Deployment Hooks
- `useDeployERC721` - Deploy ERC721 collections
- `useDeployERC1155` - Deploy ERC1155 collections

### Minting Hooks
- `useMintNFT` - Mint single NFTs
- `useBulkMint` - Mint multiple NFTs with batching

### Contract Interaction Hooks
- `useContractReader` - Read contract state
- `useTokenMetadata` - Fetch NFT metadata
- `useOwnerTokens` - Get tokens owned by address

### Utility Hooks
- `useIPFSUpload` - Upload files to IPFS
- `useGasEstimate` - Estimate transaction gas

All hooks include:
- ✅ Loading states
- ✅ Error handling
- ✅ Transaction status tracking
- ✅ Automatic retries
- ✅ Full TypeScript support

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/CONTRIBUTING.md) for:

- Development setup
- Project structure
- Testing guidelines
- Pull request process
- Code style requirements

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Links

- [NPM Package](https://www.npmjs.com/package/@cryptoart/creator-core-sdk)
- [GitHub Repository](https://github.com/wowsuchbot/creator-core-sdk)
- [Manifold Creator Core Docs](https://docs.manifold.xyz/)
- [Issue Tracker](https://github.com/wowsuchbot/creator-core-sdk/issues)

---

**Built with ❤️ for the NFT creator community**
