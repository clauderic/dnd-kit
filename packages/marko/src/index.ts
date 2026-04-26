// Public type re-exports for @dnd-kit/marko consumers.
// Tags are auto-discovered via marko.json — no imports needed for them.
export type {DragDropManager} from '@dnd-kit/dom';

// Augment Marko's $global type so <let-global from="__dndKit_manager"/> is typed.
declare global {
  namespace Marko {
    interface Global {
      __dndKit_manager?: import('@dnd-kit/dom').DragDropManager;
    }
  }
}
