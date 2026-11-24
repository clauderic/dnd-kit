import {Feedback} from '@dnd-kit/dom';
import {Show, createEffect, createMemo, createSignal} from 'solid-js';
import {dynamic, type JSX} from '@solidjs/web';

import {DragDropContext} from '../context/context.ts';
import {useDragDropManager} from '../hooks/useDragDropManager.ts';
import {useDragOperation} from '../hooks/useDragOperation.ts';

import type {DragDropManager, Draggable, Droppable, DropAnimation} from '@dnd-kit/dom';
import type {ValidComponent} from 'solid-js';
import type {Data} from '@dnd-kit/abstract';

export interface DragOverlayProps<
  T extends Data,
  U extends Draggable<T>,
> {
  class?: string;
  children: JSX.Element | ((source: U) => JSX.Element);
  /**
   * Customize or disable the drop animation that plays when a drag operation ends.
   *
   * - `undefined` – use the default animation (250ms ease)
   * - `null` – disable the drop animation entirely
   * - `{duration, easing}` – customize the animation timing
   * - `(context) => Promise<void> | void` – provide a fully custom animation function
   */
  dropAnimation?: DropAnimation | null;
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

  const source = () => dragOperation.source() as U | null;

  const isDisabled = () => {
    if (typeof props.disabled === 'function') {
      return props.disabled(source());
    }
    return props.disabled ?? false;
  };

  createEffect(
    () => source(),
    (source) => {
      if (!source) {
        setElement(undefined);
      }
    }
  );

  createEffect(
    () => ({
      manager,
      isDisabled: isDisabled(),
      overlay: element(),
      dropAnimation: props.dropAnimation,
    }),
    ({manager, isDisabled, overlay, dropAnimation}) => {
      if (!manager || isDisabled) return;

      const feedback = manager.plugins.find(
        (plugin): plugin is Feedback => plugin instanceof Feedback
      );
      if (!feedback) return;

      feedback.overlay = overlay;
      feedback.dropAnimation = dropAnimation;

      return () => {
        feedback.overlay = undefined;
        feedback.dropAnimation = undefined;
      };
    }
  );

  const Tag = dynamic(() => props.tag || 'div');

  return (
    <DragDropContext value={patchedManager()}>
      <Show when={!isDisabled() ? source() : undefined}>
        {(src) => (
          <Tag
            class={props.class}
            style={props.style}
            data-dnd-overlay
            ref={setElement}
          >
            {typeof props.children === 'function'
              ? props.children(src() as unknown as U)
              : props.children}
          </Tag>
        )}
      </Show>
    </DragDropContext>
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
