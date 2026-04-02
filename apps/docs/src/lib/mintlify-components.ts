/**
 * Wrapper around @mintlify/astro's component exports.
 * Overrides specific components (like Card) with custom implementations.
 *
 * This module is aliased via Vite to replace '@mintlify/astro/components'
 * so that all MDX content uses our custom components.
 */

// Import originals — use the internal path to avoid the Vite alias loop.
// @ts-ignore - internal module path
import {
  components as originalComponents,
  useMDXComponents as originalUseMDXComponents,
} from '@mintlify/astro-internal-components';

// Import custom overrides
import { BrandCard } from '../components/BrandCard';

const overrides = {
  Card: BrandCard,
};

export const components = {
  ...originalComponents,
  ...overrides,
};

export function useMDXComponents() {
  return {
    ...originalUseMDXComponents(),
    ...overrides,
  };
}
