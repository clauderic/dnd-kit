import type {Plugins} from '@dnd-kit/abstract';
import {OptimisticSortingPlugin} from '@dnd-kit/dom/sortable';

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

/**
 * String constants used by the context mechanism.
 * These match the Marko runtime's internal AccessorProp enum values.
 * Pinned to @marko/runtime-tags 6.0.155.
 */
export const DND_MANAGER_BRANCH_KEY = '__dnd_manager';
export const CLOSEST_BRANCH_KEY = '#ClosestBranch';
export const PARENT_BRANCH_KEY = '#ParentBranch';
