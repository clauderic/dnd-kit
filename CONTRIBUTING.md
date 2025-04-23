# Contributing to dnd-kit

Thank you for your interest in contributing to dnd-kit! This document provides guidelines and instructions for contributing to the project.

## Project Structure

dnd-kit is a monorepo managed with [Turborepo](https://turbo.build/docs). The main packages are:

- `@dnd-kit/abstract`: Core abstractions and utilities
- `@dnd-kit/dom`: DOM-specific implementation
- `@dnd-kit/react`: React-specific implementation
- `@dnd-kit/geometry`: Geometry utilities
- `@dnd-kit/state`: State management
- `@dnd-kit/collision`: Collision detection
- `@dnd-kit/helpers`: Shared helper functions

The project also includes:

- `apps/stories`: Storybook stories for testing and demonstrating features
- `apps/docs`: Documentation site

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Build all packages:
   ```bash
   bun run build
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix
2. Start the development server
   ```bash
   bun run dev
   ```
3. Make your changes
4. Verify that the packages build:
   ```bash
   bun run build
   ```
5. Submit a pull request

## Testing and Documentation

### Stories

The project uses Storybook for testing and demonstrating features. To run stories:

```bash
bun run dev
```

When adding new features:

- Add stories to demonstrate usage
- Include different variations and edge cases
- Ensure stories are interactive and testable

### Documentation

Documentation is maintained in the `apps/docs` directory. When making changes:

- Update relevant documentation
- Add examples for new features
- Ensure code examples are working
- Follow the existing documentation style

To run the documentation site locally:

```bash
npm install -g mintlify
mintlify dev
```

## Pull Request Guidelines

- Keep pull requests focused and small
- Include tests for new features
- Update documentation as needed
- Follow the existing code style
- Provide a clear description of changes
- Add changeset if your changes affect the public API
- Add or update stories for new features
- Update documentation if needed

## Code Style

- Use TypeScript for all new code
- Follow the project's ESLint configuration
- Use meaningful variable and function names
- Add appropriate comments and documentation
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass
- Maintain or improve test coverage
- Test across different browsers and devices
- Add stories for visual testing
- Update documentation with examples

## Documentation

- Update README files as needed
- Add JSDoc comments for new code
- Keep documentation up to date
- Provide examples for new features
- Add stories to demonstrate usage
- Ensure documentation is accurate and clear

## Release Process

This project uses Changesets to manage releases. When making changes that affect the public API:

1. Add a changeset:
   ```bash
   bun run changeset
   ```
2. Follow the prompts to describe your changes
3. The changeset will be included in the next release

The release process is automated and will:

1. Update version numbers based on changesets
2. Update CHANGELOG.md
3. Create release tags
4. Publish to npm

## Questions?

If you have any questions, feel free to:

- Open an [issue](https://github.com/clauderic/dnd-kit/issues/new)
- Join our [Slack community](https://dnd-kit.slack.com/)
