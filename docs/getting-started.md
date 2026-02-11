# Getting Started with Creator Core SDK

This guide will help you get started with deploying and minting NFT collections using the Creator Core SDK.

## Installation

```bash
npm install @cryptoart/creator-core-sdk viem
```

## Quick Start

### 1. Set Up Your Wallet Client

First, create a wallet client using viem:

```typescript
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount('0x...');

const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(),
});
```

### 2. Deploy a Collection

Deploy an ERC721 NFT contract:

```typescript
import { deployERC721Creator } from '@cryptoart/creator-core-sdk';

const deployment = await deployERC721Creator(
  {
    name: 'My NFT Collection',
    symbol: 'MYNFT',
    royaltyBps: 500, // 5% royalties
    royaltyReceiver: account.address,
  },
  walletClient
);

console.log('Contract deployed at:', deployment.contractAddress);
```

### 3. Mint NFTs

Mint a single NFT:

```typescript
import { mintToken } from '@cryptoart/creator-core-sdk';

const mint = await mintToken(
  {
    contractAddress: deployment.contractAddress,
    to: account.address,
    tokenURI: 'ipfs://QmXxx.../metadata.json',
  },
  walletClient
);

console.log('Minted token ID:', mint.tokenIds[0]);
```

### 4. Bulk Mint (100 NFTs)

Mint multiple NFTs efficiently:

```typescript
import { bulkMint } from '@cryptoart/creator-core-sdk';

// Prepare token metadata
const tokens = Array.from({ length: 100 }, (_, i) => ({
  to: account.address,
  tokenURI: `ipfs://QmXxx.../${i}.json`,
}));

const bulkMintResult = await bulkMint(
  {
    contractAddress: deployment.contractAddress,
    tokens,
    batchSize: 20,
    onProgress: (minted, total) => {
      console.log(`Progress: ${minted}/${total}`);
    },
  },
  walletClient
);

console.log('Minted', bulkMintResult.totalMinted, 'tokens');
```

## Next Steps

- [API Reference](./api-reference.md) - Complete API documentation
- [Examples](../examples/) - More code examples
- [Recipes](./recipes.md) - Common use case patterns

## Common Patterns

### Deploy + Mint Workflow

```typescript
import { deployERC721Creator, bulkMint } from '@cryptoart/creator-core-sdk';

// 1. Deploy
const { contractAddress } = await deployERC721Creator(
  { name: 'My Collection', symbol: 'MC' },
  walletClient
);

// 2. Prepare metadata (see metadata docs)
const tokenURIs = await prepareMetadata(images);

// 3. Bulk mint
const tokens = tokenURIs.map(uri => ({
  to: account.address,
  tokenURI: uri,
}));

await bulkMint({ contractAddress, tokens }, walletClient);
```

### With React Hooks

```typescript
import { useDeployContract, useBulkMint } from '@cryptoart/creator-core-sdk/react';

function CreateCollection() {
  const { deploy, state, result } = useDeployContract();
  const { mint, progress } = useBulkMint();

  const handleDeploy = async () => {
    await deploy({
      name: 'My NFTs',
      symbol: 'MNFT',
    });
  };

  return (
    <div>
      <button onClick={handleDeploy} disabled={state === 'deploying'}>
        {state === 'deploying' ? 'Deploying...' : 'Deploy Contract'}
      </button>
      
      {result && (
        <p>Deployed at: {result.contractAddress}</p>
      )}
    </div>
  );
}
```

## Configuration

### Gas Estimation

```typescript
import { estimateDeploymentCost, estimateBulkMintCost } from '@cryptoart/creator-core-sdk';

const deployCost = await estimateDeploymentCost('ERC721', base.id);
console.log('Deployment will cost ~$', deployCost.estimatedCostUSD);

const mintCost = await estimateBulkMintCost(100, base.id);
console.log('Minting 100 will cost ~$', mintCost.estimatedCostUSD);
console.log('Suggested batch size:', mintCost.suggestedBatchSize);
```

### Error Handling

```typescript
import { DeploymentError, MintError } from '@cryptoart/creator-core-sdk';

try {
  await deployERC721Creator(options, walletClient);
} catch (error) {
  if (error instanceof DeploymentError) {
    console.error('Deployment failed:', error.message);
    // error.recovery has suggestions
  }
}
```

## Troubleshooting

### Common Issues

**Insufficient funds**
- Ensure your wallet has enough ETH for gas
- Use gas estimation to check costs beforehand

**Transaction fails**
- Check network connection
- Verify contract parameters
- Try with a higher gas limit

**Metadata not loading**
- Ensure IPFS URLs are accessible
- Check metadata JSON format
- Verify CORS settings for hosted metadata

## Support

- [GitHub Issues](https://github.com/wowsuchbot/creator-core-sdk/issues)
- [API Reference](./api-reference.md)
- [Examples](../examples/)
