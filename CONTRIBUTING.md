# Contributing to Creator Core SDK

Thank you for your interest in contributing to Creator Core SDK! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and inclusive. We're building tools for the NFT creator community.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/creator-core-sdk.git
   cd creator-core-sdk
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

### Building

```bash
npm run build
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `chore:` - Build process or tooling changes
- `refactor:` - Code changes that neither fix bugs nor add features

Examples:
```
feat: add bulk minting with progress tracking
fix: handle failed IPFS uploads correctly
docs: update API reference for deployment functions
test: add integration tests for ERC721 deployment
```

## Pull Request Process

1. **Ensure tests pass**: All tests must pass before submitting
2. **Update documentation**: Add or update docs for any changed functionality
3. **Add tests**: New features should include tests
4. **Keep PRs focused**: One feature or fix per PR
5. **Write clear descriptions**: Explain what changed and why

### PR Checklist

- [ ] Tests pass locally
- [ ] Code follows project style (lint passes)
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] No merge conflicts

## Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Write descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and small

## Testing Guidelines

- Write unit tests for all new functions
- Add integration tests for workflows
- Use descriptive test names
- Test error cases
- Aim for >80% coverage

## Documentation

- Update API reference for function changes
- Add examples for new features
- Keep README up to date
- Document breaking changes

## Need Help?

- Check existing issues and discussions
- Ask questions in GitHub Discussions
- Reference related issues in your PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
