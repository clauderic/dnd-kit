import { createComputed, onCleanup, type Accessor } from 'solid-js';

import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { wrapStore, type ProxiedStore } from '../../utilities/preactSignals.ts';

import type {Draggable, Droppable, DragDropManager} from '@dnd-kit/dom';
import type { Data } from '@dnd-kit/abstract';

export interface UseDragOperationOptions {
    manager?: DragDropManager;
}

export function useDragOperation<
  T extends Data = Data,
  U extends Draggable<T> = Draggable<T>,
  V extends Droppable<T> = Droppable<T>,
  W extends DragDropManager<T, U, V> = DragDropManager<T, U, V>,
>(options: UseDragOperationOptions = {}): ProxiedStore<DragDropManager['dragOperation']> {
    const contextManager = useDragDropManager<T, U, V, W>();
    const manager = (() => options.manager ?? contextManager) as Accessor<W | null>;

    if (!manager()) {
        throw new Error(
            'useDragOperation must be used within a DragDropProvider or provided with a manager. '
            + 'Make sure your app is wrapped in a DragDropProvider component or pass a manager prop.'
        );
    }

    let store: ProxiedStore<DragDropManager['dragOperation']>;

    createComputed(() => {
        store = wrapStore(manager()!.dragOperation);

        onCleanup(() => store.dispose());
    });

    return store!;
}
