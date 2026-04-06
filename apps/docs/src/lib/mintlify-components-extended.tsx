/**
 * Re-exports everything from @mintlify/components, plus our custom
 * SandpackEditor component. This is aliased via Vite to replace
 * '@mintlify/components' so that generated MDX snippets can reference
 * SandpackEditor without an explicit import (Mintlify strips imports).
 */
// @ts-ignore - aliased to original package
export * from '@mintlify/components-original';
export { CodeSandbox as SandpackEditor } from '../components/CodeSandbox';
