<script lang="ts">
  import type {Snippet} from 'svelte';
  import type {DragDropManager, Draggable, DropAnimation} from '@dnd-kit/dom';
  import {Feedback} from '@dnd-kit/dom';

  import {createDeepSignal} from '../../utilities/createDeepSignal.svelte.js';
  import {getDragDropManager} from '../hooks/getDragDropManager.js';
  import {DND_CONTEXT_KEY, setDragDropContext} from '../context/context.js';

  interface Props {
    /**
     * Whether the drag overlay is disabled.
     */
    disabled?: boolean;
    /**
     * Customize or disable the drop animation that plays when a drag operation ends.
     *
     * - `undefined` – use the default animation (250ms ease)
     * - `null` – disable the drop animation entirely
     * - `{duration, easing}` – customize the animation timing
     * - `(context) => Promise<void> | void` – provide a fully custom animation function
     */
    dropAnimation?: DropAnimation | null;
    /**
     * Content to render inside the overlay.
     * Receives the drag source as a snippet parameter.
     */
    children?: Snippet<[Draggable]>;
  }

  let {disabled = false, dropAnimation, children}: Props = $props();

  const manager = getDragDropManager();
  let overlayElement = $state<HTMLElement | null>(null);

  const trackedDragOperation = createDeepSignal(() => manager.dragOperation);

  // Provide a patched manager that prevents children from registering
  const noop = () => () => {};

  const patchedRegistry = new Proxy(manager.registry, {
    get(target, property) {
      if (property === 'register' || property === 'unregister') {
        return noop;
      }

      return target[property as keyof typeof target];
    },
  });

  const patchedManager = new Proxy(manager, {
    get(target, property) {
      if (property === 'registry') {
        return patchedRegistry;
      }

      return target[property as keyof typeof target];
    },
  }) as DragDropManager;

  setDragDropContext(patchedManager);

  // Register overlay element and dropAnimation with the Feedback plugin
  $effect(() => {
    const el = overlayElement;
    if (!el || disabled) return;

    const feedback = manager.plugins.find(
      (plugin): plugin is Feedback => plugin instanceof Feedback
    );

    if (!feedback) return;

    feedback.overlay = el;
    feedback.dropAnimation = dropAnimation;

    return () => {
      feedback.overlay = undefined;
      feedback.dropAnimation = undefined;
    };
  });
</script>

<div bind:this={overlayElement} data-dnd-overlay>
  {#if !disabled && trackedDragOperation.current.source}
    {@render children?.(trackedDragOperation.current.source)}
  {/if}
</div>
