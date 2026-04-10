import type { Plugins } from '@dnd-kit/abstract';
import { OptimisticSortingPlugin } from '@dnd-kit/dom/sortable';

/**
 * Filter OptimisticSortingPlugin from the default plugin list.
 *
 * OptimisticSortingPlugin directly mutates DOM nodes during drag to provide
 * visual feedback before state is committed. This conflicts with Marko's
 * <for> reconciler which manages DOM order. Without this filter, Marko's
 * reconciler and the plugin fight over DOM node order during drag.
 *
 * Same approach used by the Svelte adapter.
 */
export const withoutOptimisticSorting = (defaults: Plugins): Plugins =>
  defaults.filter((p) => p !== OptimisticSortingPlugin);
