import {Feedback} from '@dnd-kit/dom';
import {Show, createEffect, createMemo, createSignal, onCleanup} from 'solid-js';
import {Dynamic} from 'solid-js/web';

import {DragDropContext} from '../context/context.ts';
import {useDragDropManager} from '../hooks/useDragDropManager.ts';
import {useDragOperation} from '../hooks/useDragOperation.ts';

import type {DragDropManager, Draggable, Droppable} from '@dnd-kit/dom';
import type {JSX, ValidComponent} from 'solid-js';
import type {Data} from '@dnd-kit/abstract';

export interface DragOverlayProps<
  T extends Data,
  U extends Draggable<T>,
> {
  class?: string;
  children: JSX.Element | ((source: U) => JSX.Element);
  style?: JSX.CSSProperties;
  tag?: ValidComponent;
  disabled?: boolean | ((source: U | null) => boolean);
}

export function DragOverlay<T extends Data, U extends Draggable<T>>(
  props: DragOverlayProps<T, U>
) {
  const [element, setElement] = createSignal<HTMLElement>();
  const manager = useDragDropManager();
  const patchedManager = createPatchedManager(() => manager);
  const dragOperation = useDragOperation();

  const source = () => dragOperation.source as U | null;

  const isDisabled = () => {
    if (typeof props.disabled === 'function') {
      return props.disabled(source());
    }
    return props.disabled ?? false;
  };

  createEffect(() => {
    if (!source()) {
      setElement(undefined);
    }
  });

  createEffect(() => {
    const _manager = manager;

    if (!_manager || isDisabled()) return;

    const feedback = _manager.plugins.find(
      (plugin): plugin is Feedback => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.overlay = element();

    onCleanup(() => {
      feedback.overlay = undefined;
    });
  });

  return (
    <DragDropContext.Provider value={patchedManager()}>
      <Show when={!isDisabled() ? source() : undefined}>
        {(src) => (
          <Dynamic
            component={props.tag || 'div'}
            class={props.class}
            style={props.style}
            data-dnd-overlay
            ref={setElement}
          >
            {typeof props.children === 'function'
              ? props.children(src() as unknown as U)
              : props.children}
          </Dynamic>
        )}
      </Show>
    </DragDropContext.Provider>
  );
}

function createPatchedManager<
  T extends Data,
  U extends Draggable<T>,
  V extends Droppable<T>,
  W extends DragDropManager<T, U, V>,
>(manager: () => W | null) {
  return createMemo(() => {
    const _manager = manager();

    if (!_manager) return null;

    const patchedRegistry = new Proxy(_manager.registry, {
      get(target, property) {
        if (property === 'register' || property === 'unregister') {
          return noop;
        }
        return target[property as keyof typeof target];
      },
    });

    return new Proxy(_manager, {
      get(target, property) {
        if (property === 'registry') {
          return patchedRegistry;
        }
        return target[property as keyof typeof target];
      },
    });
  });
}

function noop() {
  return () => {};
}
