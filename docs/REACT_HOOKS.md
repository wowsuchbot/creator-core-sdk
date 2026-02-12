# React Hooks Guide

Comprehensive guide for using the Creator Core SDK React hooks with full TypeScript support.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Deployment Hooks](#deployment-hooks)
  - [useDeployERC721](#usedeployerc721)
  - [useDeployERC1155](#usedeployerc1155)
- [Minting Hooks](#minting-hooks)
  - [useMintNFT](#usemintnft)
  - [useBatchMint](#usebatchmint)
- [Contract Reading Hooks](#contract-reading-hooks)
  - [useCreatorContract](#usecreatorcontract)
  - [useTokenURI](#usetokenuri)
  - [useBalanceOf](#usebalanceof)
  - [useOwnerOf](#useownerof)
- [TypeScript Types](#typescript-types)

## Installation

```bash
npm install @cryptoart/creator-core-sdk wagmi viem @tanstack/react-query
```

Or with yarn:

```bash
yarn add @cryptoart/creator-core-sdk wagmi viem @tanstack/react-query
```

## Setup

First, set up wagmi in your app:

```tsx
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { base } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { chains, publicClient } = configureChains(
  [base],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: true,
  publicClient,
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </WagmiConfig>
  );
}
```

## Deployment Hooks

### useDeployERC721

Deploy a new ERC721 Creator contract.

#### Example

```tsx
import { useDeployERC721 } from '@cryptoart/creator-core-sdk/react';
import { useState } from 'react';

function DeployERC721Button() {
  const { 
    deploy, 
    status, 
    isSuccess, 
    isPending, 
    result, 
    error 
  } = useDeployERC721();

  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');

  const handleDeploy = async () => {
    try {
      const deployment = await deploy({
        name,
        symbol,
        factoryAddress: '0x...', // Your factory contract address
      });
      
      console.log('Contract deployed at:', deployment.contractAddress);
      console.log('Transaction hash:', deployment.transactionHash);
      console.log('Block number:', deployment.blockNumber);
    } catch (err) {
      console.error('Deployment failed:', err);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Collection Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Symbol" 
        value={symbol} 
        onChange={(e) => setSymbol(e.target.value)} 
      />
      
      <button onClick={handleDeploy} disabled={isPending}>
        {isPending ? 'Deploying...' : 'Deploy Contract'}
      </button>
      
      {status === 'confirming' && <p>Confirming transaction...</p>}
      {isSuccess && result && (
        <p>Deployed at: {result.contractAddress}</p>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Type Definitions

```typescript
interface DeployERC721Config {
  name: string;
  symbol: string;
  factoryAddress: Address;
}

interface UseDeployERC721Return {
  deploy: (config: DeployERC721Config) => Promise<DeploymentResult>;
  status: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: DeploymentError | null;
  result: DeploymentResult | null;
  transactionHash: Hex | null;
  reset: () => void;
}
```

### useDeployERC1155

Deploy a new ERC1155 Creator contract. Usage is identical to `useDeployERC721`.

```tsx
import { useDeployERC1155 } from '@cryptoart/creator-core-sdk/react';

function DeployERC1155Button() {
  const { deploy, status, result } = useDeployERC1155();
  
  const handleDeploy = async () => {
    const deployment = await deploy({
      name: 'My Multi-Token Collection',
      symbol: 'MMT',
      factoryAddress: '0x...',
    });
    console.log('Deployed at:', deployment.contractAddress);
  };
  
  return <button onClick={handleDeploy}>Deploy ERC1155</button>;
}
```

## Minting Hooks

### useMintNFT

Mint a single NFT with transaction tracking and progress updates.

#### Example

```tsx
import { useMintNFT } from '@cryptoart/creator-core-sdk/react';

function MintNFTButton() {
  const { 
    mint, 
    status, 
    isSuccess, 
    result, 
    progress, 
    error 
  } = useMintNFT();

  const handleMint = async () => {
    try {
      const mintResult = await mint({
        contractAddress: '0x...', // Your deployed contract
        to: '0x...', // Recipient address
        uri: 'ipfs://...', // Optional token URI
      });
      
      console.log('Minted token ID:', mintResult.tokenId);
      console.log('Transaction hash:', mintResult.transactionHash);
    } catch (err) {
      console.error('Minting failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleMint} disabled={status !== 'idle'}>
        Mint NFT
      </button>
      
      {/* Progress bar */}
      <div style={{ width: '100%', background: '#eee' }}>
        <div 
          style={{ 
            width: `${progress}%`, 
            background: '#4caf50', 
            height: '20px' 
          }} 
        />
      </div>
      
      <p>Status: {status} ({progress}%)</p>
      
      {isSuccess && result && (
        <p>Minted Token ID: {result.tokenId.toString()}</p>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Type Definitions

```typescript
interface MintNFTConfig {
  contractAddress: Address;
  to: Address;
  uri?: string;
}

interface UseMintNFTReturn {
  mint: (config: MintNFTConfig) => Promise<MintResult>;
  status: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: MintError | null;
  result: MintResult | null;
  transactionHash: Hex | null;
  progress: number; // 0-100
  reset: () => void;
}
```

### useBatchMint

Mint multiple NFTs in a single transaction with detailed progress tracking.

#### Example

```tsx
import { useBatchMint } from '@cryptoart/creator-core-sdk/react';

function BatchMintButton() {
  const { 
    batchMint, 
    status, 
    isSuccess, 
    result, 
    progress, 
    error 
  } = useBatchMint();

  const handleBatchMint = async () => {
    try {
      // Mint 10 NFTs without specific URIs
      const result = await batchMint({
        contractAddress: '0x...',
        to: '0x...',
        count: 10,
      });
      
      console.log('Minted token IDs:', result.tokenIds);
    } catch (err) {
      console.error('Batch minting failed:', err);
    }
  };

  const handleBatchMintWithURIs = async () => {
    try {
      // Mint NFTs with specific URIs
      const result = await batchMint({
        contractAddress: '0x...',
        to: '0x...',
        uris: [
          'ipfs://QmTokenA',
          'ipfs://QmTokenB',
          'ipfs://QmTokenC',
        ],
      });
      
      console.log('Minted token IDs:', result.tokenIds);
    } catch (err) {
      console.error('Batch minting failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleBatchMint}>Mint 10 NFTs</button>
      <button onClick={handleBatchMintWithURIs}>Mint with URIs</button>
      
      {/* Detailed progress */}
      <div>
        <p>{progress.message}</p>
        <progress value={progress.percentage} max={100} />
        <span>{progress.percentage}%</span>
      </div>
      
      {isSuccess && result && (
        <div>
          <p>Successfully minted {result.tokenIds.length} NFTs</p>
          <ul>
            {result.tokenIds.map((id) => (
              <li key={id.toString()}>Token ID: {id.toString()}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

#### Type Definitions

```typescript
interface BatchMintConfig {
  contractAddress: Address;
  to: Address;
  count?: number;  // Use either count OR uris
  uris?: string[]; // Use either count OR uris
}

interface BatchMintProgress {
  percentage: number;
  stage: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';
  message: string;
}

interface UseBatchMintReturn {
  batchMint: (config: BatchMintConfig) => Promise<MintBatchResult>;
  status: 'idle' | 'preparing' | 'pending' | 'confirming' | 'success' | 'error';
  isIdle: boolean;
  isPreparing: boolean;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: BatchMintError | null;
  result: MintBatchResult | null;
  transactionHash: Hex | null;
  progress: BatchMintProgress;
  reset: () => void;
}
```

## Contract Reading Hooks

### useCreatorContract

Read contract state with automatic batching for efficiency.

#### Example

```tsx
import { useCreatorContract } from '@cryptoart/creator-core-sdk/react';

function ContractInfo({ contractAddress }: { contractAddress: Address }) {
  const { 
    name, 
    symbol, 
    totalSupply, 
    metadata,
    isLoadingMetadata,
    getTokenURI,
    getBalanceOf,
    refetchMetadata,
  } = useCreatorContract({ 
    contractAddress,
    enabled: true, // Optional: disable fetching
  });

  const handleGetTokenURI = async (tokenId: bigint) => {
    const uri = await getTokenURI(tokenId);
    console.log('Token URI:', uri);
  };

  const handleGetBalance = async (owner: Address) => {
    const balance = await getBalanceOf(owner);
    console.log('Balance:', balance);
  };

  if (isLoadingMetadata) return <p>Loading...</p>;

  return (
    <div>
      <h2>{name} ({symbol})</h2>
      <p>Total Supply: {totalSupply?.toString()}</p>
      
      <button onClick={() => handleGetTokenURI(1n)}>
        Get Token #1 URI
      </button>
      
      <button onClick={() => handleGetBalance('0x...')}>
        Check Balance
      </button>
      
      <button onClick={refetchMetadata}>
        Refresh Metadata
      </button>
    </div>
  );
}
```

### useTokenURI

Read a specific token's URI.

```tsx
import { useTokenURI } from '@cryptoart/creator-core-sdk/react';

function TokenURIDisplay({ contractAddress, tokenId }: { 
  contractAddress: Address; 
  tokenId: bigint; 
}) {
  const { uri, isLoading, isError, refetch } = useTokenURI(
    contractAddress, 
    tokenId
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading URI</p>;

  return (
    <div>
      <p>URI: {uri}</p>
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

### useBalanceOf

Read an address's NFT balance.

```tsx
import { useBalanceOf } from '@cryptoart/creator-core-sdk/react';
import { useAccount } from 'wagmi';

function MyBalance({ contractAddress }: { contractAddress: Address }) {
  const { address } = useAccount();
  const { balance, isLoading } = useBalanceOf(contractAddress, address!);

  if (!address) return <p>Connect wallet</p>;
  if (isLoading) return <p>Loading...</p>;

  return <p>You own {balance?.toString()} NFTs</p>;
}
```

### useOwnerOf

Read a token's owner.

```tsx
import { useOwnerOf } from '@cryptoart/creator-core-sdk/react';

function TokenOwner({ contractAddress, tokenId }: { 
  contractAddress: Address; 
  tokenId: bigint; 
}) {
  const { owner, isLoading } = useOwnerOf(contractAddress, tokenId);

  if (isLoading) return <p>Loading...</p>;

  return <p>Owner: {owner}</p>;
}
```

## TypeScript Types

All hooks are fully typed. Import types as needed:

```typescript
import type {
  // Deployment types
  DeployERC721Config,
  DeployERC1155Config,
  DeploymentResult,
  DeploymentError,
  UseDeployERC721Return,
  UseDeployERC1155Return,
  
  // Minting types
  MintNFTConfig,
  BatchMintConfig,
  MintResult,
  MintBatchResult,
  MintError,
  BatchMintError,
  BatchMintProgress,
  UseMintNFTReturn,
  UseBatchMintReturn,
  
  // Reading types
  CreatorContractConfig,
  ContractMetadata,
  TokenOwnership,
  UseCreatorContractReturn,
} from '@cryptoart/creator-core-sdk/react';
```

## Complete Example App

```tsx
import { 
  useDeployERC721, 
  useMintNFT, 
  useCreatorContract 
} from '@cryptoart/creator-core-sdk/react';
import { useState } from 'react';
import type { Address } from 'viem';

function NFTManager() {
  const [contractAddress, setContractAddress] = useState<Address | null>(null);
  
  // Deploy hook
  const { 
    deploy, 
    isSuccess: isDeploySuccess, 
    result: deployResult 
  } = useDeployERC721();
  
  // Mint hook
  const { 
    mint, 
    isSuccess: isMintSuccess, 
    result: mintResult,
    progress 
  } = useMintNFT();
  
  // Read hook
  const { 
    name, 
    symbol, 
    totalSupply 
  } = useCreatorContract({ 
    contractAddress: contractAddress!,
    enabled: !!contractAddress,
  });
  
  const handleDeploy = async () => {
    const result = await deploy({
      name: 'My Collection',
      symbol: 'MC',
      factoryAddress: '0x...',
    });
    setContractAddress(result.contractAddress);
  };
  
  const handleMint = async () => {
    if (!contractAddress) return;
    await mint({
      contractAddress,
      to: '0x...', // recipient
      uri: 'ipfs://...',
    });
  };
  
  return (
    <div>
      <h1>NFT Manager</h1>
      
      {!contractAddress && (
        <button onClick={handleDeploy}>Deploy Contract</button>
      )}
      
      {contractAddress && (
        <div>
          <h2>{name} ({symbol})</h2>
          <p>Contract: {contractAddress}</p>
          <p>Total Supply: {totalSupply?.toString()}</p>
          
          <button onClick={handleMint}>Mint NFT</button>
          <progress value={progress} max={100} />
          
          {isMintSuccess && mintResult && (
            <p>Minted token #{mintResult.tokenId.toString()}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default NFTManager;
```

## Error Handling

All hooks provide detailed error information:

```tsx
const { deploy, error } = useDeployERC721();

if (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  console.error('Error details:', error.details);
}
```

Common error codes:
- `WALLET_NOT_CONNECTED`: User's wallet is not connected
- `WRITE_ERROR`: Transaction was rejected or failed
- `PARSE_ERROR`: Failed to parse transaction receipt
- `TIMEOUT`: Transaction took too long to confirm
- `INVALID_CONFIG`: Invalid configuration provided

## Best Practices

1. **Always handle errors**: Wrap async operations in try-catch blocks
2. **Show progress**: Use status and progress indicators for better UX
3. **Disable buttons during operations**: Prevent double-submissions
4. **Reset state when needed**: Use the `reset()` function to clear errors
5. **Type everything**: Leverage TypeScript for compile-time safety
6. **Enable/disable queries**: Use the `enabled` option to control when data fetches

## Support

For issues or questions, please visit [GitHub Issues](https://github.com/wowsuchbot/creator-core-sdk/issues).
