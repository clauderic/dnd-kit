import type {DragDropManager} from '@dnd-kit/abstract';

// A private cross-bundle capability: DOM placement work joins the observer's
// transaction without adding a public method, option, or package export.
const transaction = Symbol.for('@dnd-kit/abstract/collision-transaction');
type Transaction = (() => void) & {run(callback: () => void): void};

export function acquireCollisionTransaction(
  manager: DragDropManager<any, any>
) {
  const observer =
    manager.collisionObserver as typeof manager.collisionObserver & {
      [transaction]?: () => Transaction;
    };

  // The collision event gate remains compatible with older abstract versions.
  return (
    observer[transaction]?.() ??
    Object.assign(() => {}, {
      run: (callback: () => void) => callback(),
    })
  );
}
