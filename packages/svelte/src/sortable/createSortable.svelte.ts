import {type Data} from '@dnd-kit/abstract';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {
  defaultSortableTransition,
  Sortable,
  SortableKeyboardPlugin,
} from '@dnd-kit/dom/sortable';
import {batch} from '@dnd-kit/state';

import {createDeepSignal} from '../utilities/createDeepSignal.svelte.js';
import {createInstance} from '../core/hooks/createInstance.svelte.js';

export type CreateSortableInput<T extends Data = Data> = Omit<
  SortableInput<T>,
  'handle' | 'element' | 'source' | 'target' | 'register'
>;

const sveltePlugins = [SortableKeyboardPlugin];

export function createSortable<T extends Data = Data>(
  input: CreateSortableInput<T>
) {
  const sortable = createInstance((manager) => {
    return new Sortable(
      {
        ...input,
        register: false,
        plugins: input.plugins ?? sveltePlugins,
        transition: {
          ...defaultSortableTransition,
          ...input.transition,
        },
      },
      manager
    );
  });

  const tracked = createDeepSignal(() => sortable);

  // Sync reactive properties from input getters
  $effect(() => {
    sortable.id = input.id;
    sortable.disabled = input.disabled ?? false;
    sortable.alignment = input.alignment;
    sortable.plugins = input.plugins ?? sveltePlugins;
    sortable.modifiers = input.modifiers;
    sortable.sensors = input.sensors;
    sortable.accept = input.accept;
    sortable.type = input.type;
    sortable.collisionPriority = input.collisionPriority;
    sortable.collisionDetector = input.collisionDetector;
    sortable.transition = {
      ...defaultSortableTransition,
      ...input.transition,
    };

    if (input.data) {
      sortable.data = input.data;
    }
  });

  // Batch group/index updates to ensure atomic state changes
  $effect.pre(() => {
    const group = input.group;
    const index = input.index;

    batch(() => {
      sortable.group = group;
      sortable.index = index;
    });
  });

  // Refresh shape when index changes while idle
  $effect(() => {
    void input.index;

    if (
      sortable.manager?.dragOperation.status.idle &&
      sortable.transition?.idle
    ) {
      sortable.refreshShape();
    }
  });

  return {
    get sortable() {
      return sortable;
    },
    get isDragging() {
      return tracked.current.isDragging;
    },
    get isDropping() {
      return tracked.current.isDropping;
    },
    get isDragSource() {
      return tracked.current.isDragSource;
    },
    get isDropTarget() {
      return tracked.current.isDropTarget;
    },
    attach(node: HTMLElement) {
      sortable.element = node;

      return () => {
        if (
          sortable.element?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.element = undefined;
      };
    },
    attachHandle(node: HTMLElement) {
      sortable.handle = node;

      return () => {
        sortable.handle = undefined;
      };
    },
    attachSource(node: HTMLElement) {
      sortable.source = node;

      return () => {
        if (
          sortable.source?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.source = undefined;
      };
    },
    attachTarget(node: HTMLElement) {
      sortable.target = node;

      return () => {
        if (
          sortable.target?.isConnected &&
          !sortable.manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.target = undefined;
      };
    },
  };
}
