# Creator-Core SDK Technical Requirements

## Executive Summary

Build a TypeScript SDK that wraps creator-core NFT contract interactions, enabling developers to deploy and manage NFT collections with minimal code. Primary use cases: bulk NFT creation for LSSVM pools and integration into the cryptoart-studio MVP app.

## Core Problems Being Solved

1. **Archived UI Failed Because**: No robust contract interaction layer - minting functions were TODO stubs
2. **LSSVM Integration Need**: Create 100 NFTs + deploy to pool in 1-2 clicks total
3. **MVP App Need**: Simple, reliable NFT creation from within the turbo repo
4. **Developer Experience**: Clean abstraction over complex Web3 operations

## Technical Requirements

### 1. Contract Support

**MUST Support:**
- ERC721 (basic NFT standard)
- ERC1155 (multi-edition standard)
- Creator Core contracts from mxjxn/creator-core-solidity submodule

**Contract Operations:**
- Deploy new collections (with configurable parameters)
- Mint single NFTs
- Bulk mint (optimized for 100+ NFTs)
- Set token URIs / metadata
- Transfer ownership
- Configure royalties (EIP-2981)

**NOT In Scope (v1):**
- ERC6551 (token-bound accounts) - archived UI showed "not implemented"
- Upgradeable proxies - add in v2 if needed
- Advanced extensions - focus on core functionality first

### 2. Metadata Management

**Requirements:**
- Generate ERC721/ERC1155 compliant JSON metadata
- IPFS upload support (primary)
- Arweave upload support (secondary, leverage existing cryptoart-studio integration)
- Centralized storage option (for testing/development)

**Metadata Fields:**
- name, description, image (required)
- attributes/properties (array of trait objects)
- animation_url, external_url (optional)
- Validation against standards

**Bulk Operations:**
- Generate metadata for 100+ NFTs efficiently
- Batch IPFS uploads with progress tracking
- Handle upload failures gracefully

### 3. Transaction Handling

**Critical (Lessons from Archived UI):**
- Proper transaction monitoring (not just fire-and-forget)
- Gas estimation with buffer
- Transaction retry logic
- Clear error messages (not just generic Web3 errors)
- Progress callbacks for long-running operations

**Gas Optimization:**
- Batch operations where possible
- Estimate costs before execution
- Allow gas price configuration
- Warn on high gas scenarios

### 4. Developer Experience

**TypeScript First:**
- Full type safety
- IntelliSense support
- Documented types for all operations

**Simple API:**
```typescript
// Deploy collection
const collection = await sdk.deployERC721({
  name: "My Collection",
  symbol: "MC",
  royaltyRecipient: "0x...",
  royaltyBps: 500 // 5%
});

// Bulk mint 100 NFTs
const result = await collection.bulkMint({
  to: "0x...",
  count: 100,
  metadataGenerator: (index) => ({
    name: `NFT #${index}`,
    description: "Generated NFT",
    image: `ipfs://.../${index}.png`
  }),
  onProgress: (current, total) => {
    console.log(`Minting ${current}/${total}`);
  }
});
```

**Framework Integration:**
- React hooks for common operations
- State management helpers
- wagmi/viem compatibility (already used in cryptoart-studio)

### 5. Package Structure

**Exports:**
- `@cryptoart/creator-core-sdk` - Core SDK
- `@cryptoart/creator-core-sdk/react` - React hooks
- `@cryptoart/creator-core-sdk/metadata` - Metadata utilities

**Dual Module Support:**
- ESM (import)
- CommonJS (require)

**Minimal Dependencies:**
- viem (already in cryptoart-studio stack)
- Avoid heavy dependencies that bloat bundle size

### 6. Integration Points

**LSSVM Workflow:**
```typescript
// Create 100 NFTs
const nfts = await collection.bulkMint({ count: 100, ... });

// Deploy to LSSVM pool (handled by such-lssvm repo)
const pool = await lssvm.createPool({
  nftContract: collection.address,
  tokenIds: nfts.map(n => n.tokenId)
});
```

**Cryptoart-Studio MVP Integration:**
- Import as package dependency in turbo repo
- Use in Next.js API routes and client components
- Share types across packages
- Leverage existing DB layer for persistence

### 7. Error Handling

**Common Scenarios:**
- Network failures (retry with exponential backoff)
- Insufficient gas (clear error + estimation)
- Contract reverts (parse and explain)
- Metadata upload failures (retry individual files)
- User rejection (distinguish from errors)

**Error Types:**
```typescript
class DeploymentError extends Error { ... }
class MintingError extends Error { ... }
class MetadataError extends Error { ... }
class InsufficientGasError extends Error { ... }
```

### 8. Testing Requirements

**Unit Tests:**
- Metadata generation and validation
- Error handling logic
- Type validation

**Integration Tests:**
- Contract deployment (against test networks)
- Minting operations
- Bulk operations

**Test Networks:**
- Support for local hardhat/anvil
- Sepolia testnet
- Mainnet fork testing

### 9. Documentation

**Must Have:**
- Quick start guide (5 minutes to first NFT)
- API reference (all methods documented)
- Example projects:
  - Basic minting
  - Bulk creation
  - LSSVM integration
  - React app integration
- Troubleshooting guide (common errors)
- Migration guide (if replacing old patterns)

### 10. Performance Targets

**Bulk Minting (100 NFTs):**
- Metadata generation: < 5 seconds
- IPFS upload: < 30 seconds (with concurrency)
- Minting transactions: depends on network, but optimized batching
- Total: aim for < 2 minutes end-to-end

**Bundle Size:**
- Core SDK: < 50KB gzipped
- React hooks: < 10KB additional

## Architecture Decisions

### Use Viem (Not Ethers)

**Rationale:**
- Already in cryptoart-studio stack
- Better TypeScript support
- Smaller bundle size
- Modern API design

### Stateless SDK Design

**Rationale:**
- Avoid complex state management in SDK
- Let applications handle state (React Query, Zustand, etc.)
- Easier to test and debug

### Progressive Enhancement

**v1 Scope:**
- Deploy ERC721/ERC1155
- Single and bulk minting
- Basic metadata management
- IPFS uploads

**Future Enhancements:**
- Upgradeable contracts
- Advanced extensions
- Gasless transactions (meta-transactions)
- Multi-chain support

## Success Criteria

1. ✅ Deploy and mint 100 NFTs in < 10 lines of code
2. ✅ Zero minting failures on bulk operations
3. ✅ Clear error messages for all failure modes
4. ✅ Works in both Next.js and vanilla React
5. ✅ Full TypeScript coverage
6. ✅ < 100KB total bundle size
7. ✅ Published to npm
8. ✅ Integrated into cryptoart-studio MVP
9. ✅ Successfully creates LSSVM pools with bulk-minted NFTs

## Non-Goals (Out of Scope)

- Smart contract development (use existing creator-core-solidity)
- NFT marketplace features (handled by other packages)
- Token economics or pricing (app-level concerns)
- Indexing/subgraphs (handled by creator-core-indexer)
- UI components (might be separate @cryptoart/ui-creator package)

## Dependencies on Other Systems

**Required:**
- mxjxn/creator-core-solidity contracts (deployed or source)
- IPFS gateway/pinning service (Pinata, NFT.Storage, or similar)
- Ethereum RPC provider (Alchemy, Infura, or custom)

**Optional:**
- Arweave gateway (for Arweave metadata storage)
- The Graph endpoint (for querying collection data)

## Timeline Estimate

**Phase 1 - Foundation (Week 1):**
- TypeScript project setup
- ABI imports from creator-core-contracts
- Basic deployment functions
- Single mint operations

**Phase 2 - Bulk Operations (Week 2):**
- Metadata generation utilities
- IPFS integration
- Bulk minting with progress tracking
- Error handling and retries

**Phase 3 - Developer Experience (Week 3):**
- React hooks
- Example projects
- Documentation
- Testing suite

**Phase 4 - Integration & Polish (Week 4):**
- Integrate into cryptoart-studio MVP
- LSSVM workflow validation
- Performance optimization
- npm publishing

## Risk Assessment

**High Risk:**
- Gas costs for bulk operations (mitigation: batch optimization)
- IPFS upload reliability (mitigation: retry logic + multiple providers)
- Contract upgrade compatibility (mitigation: version pinning)

**Medium Risk:**
- Bundle size bloat (mitigation: tree-shaking, minimal deps)
- Type complexity (mitigation: good docs, examples)

**Low Risk:**
- Breaking changes in viem (stable API)
- Network failures (standard Web3 challenge, well-understood solutions)
