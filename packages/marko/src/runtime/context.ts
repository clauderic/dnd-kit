/**
 * Runtime context utilities for @dnd-kit/marko.
 *
 * `findDndManager` walks the Marko branch chain to find the manager
 * stored by the nearest ancestor <drag-drop-provider>.
 *
 * Branch chain anatomy:
 *   scope["#ClosestBranch"]  → the branch this scope renders inside
 *   branch["#ParentBranch"]  → the parent branch in the rendering hierarchy
 *
 * The provider's translator writes manager to its own branch during the
 * render/input phase (before effects). By the time our consumer effect
 * fires, the manager is guaranteed to be on the branch.
 */

import type {DragDropManager} from '@dnd-kit/dom';

const CLOSEST_BRANCH = '#ClosestBranch';
const PARENT_BRANCH = '#ParentBranch';
const DND_MANAGER_KEY = '__dnd_manager';

/**
 * Walk the Marko rendering branch chain to find the DragDropManager
 * stored by the nearest ancestor <drag-drop-provider>.
 *
 * Called from the effect statement injected by consumer tag translators.
 * The `scope` parameter is the user's scope (scopeIdentifier at translate time).
 */
export function findDndManager(scope: object): DragDropManager {
  let branch: Record<string, unknown> | undefined = (scope as any)[
    CLOSEST_BRANCH
  ];

  while (branch) {
    if (DND_MANAGER_KEY in branch) {
      return branch[DND_MANAGER_KEY] as DragDropManager;
    }
    branch = branch[PARENT_BRANCH] as Record<string, unknown> | undefined;
  }

  throw new Error(
    '[dnd-kit/marko] Could not find a DragDropManager. ' +
      'Make sure <create-draggable>, <create-droppable>, or <create-sortable> ' +
      'is rendered inside a <drag-drop-provider>.'
  );
}
