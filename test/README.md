# Tests

Test suite for Creator Core SDK.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Test Structure

- `unit/` - Unit tests for individual functions
- `integration/` - Integration tests with contracts
- `e2e/` - End-to-end workflow tests
- `fixtures/` - Test data and mocks

## Writing Tests

Use Vitest for testing:

```typescript
import { describe, it, expect } from 'vitest';
import { deployERC721Creator } from '../src/contracts/deploy';

describe('deployERC721Creator', () => {
  it('should deploy contract', async () => {
    // Test implementation
  });
});
```
