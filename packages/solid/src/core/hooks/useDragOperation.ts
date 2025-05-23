import { createComputed, onCleanup } from 'solid-js';

import { useDragDropManager } from '../hooks/useDragDropManager.ts';
import { wrapStore, type ProxiedStore } from '../../utilities/preactSignals.ts';

import type { DragDropManager } from '@dnd-kit/dom';

export interface UseDragOperationOptions {
    manager?: DragDropManager;
}

export function useDragOperation(options: UseDragOperationOptions = {}): ProxiedStore<DragDropManager['dragOperation']> {
    const manager = options.manager ?? useDragDropManager();

    if (!manager) {
        throw new Error(
            'useDragOperation must be used within a DragDropProvider or provided with a manager. '
            + 'Make sure your app is wrapped in a DragDropProvider component or pass a manager prop.'
        );
    }

    let store: ProxiedStore<DragDropManager['dragOperation']>;

    createComputed(() => {
        store = wrapStore(manager.dragOperation);

        onCleanup(() => store.dispose());
    });

    return store!;
}
