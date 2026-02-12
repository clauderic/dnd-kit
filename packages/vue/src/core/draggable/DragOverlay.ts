import {Feedback} from '@dnd-kit/dom';
import type {DragDropManager, DropAnimation} from '@dnd-kit/dom';
import {
  computed,
  defineComponent,
  h,
  onUnmounted,
  ref,
  watchEffect,
  type PropType,
} from 'vue';

import {useDeepSignal} from '../../composables/useDeepSignal.ts';
import {provideDragDropContext} from '../context/context.ts';
import {useDragDropManager} from '../hooks/useDragDropManager.ts';

export interface DragOverlayProps {
  /**
   * The HTML tag to render as the overlay wrapper element.
   * @default 'div'
   */
  tag?: string;
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
}

const noop = () => () => {};

export default /* #__PURE__ */ defineComponent({
  name: 'DragOverlay',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dropAnimation: {
      type: [Object, Function] as PropType<DropAnimation | null>,
      default: undefined,
    },
  },
  setup(props, {slots}) {
    const manager = useDragDropManager();
    const overlayRef = ref<HTMLElement | null>(null);

    const trackedDragOperation = useDeepSignal(
      computed(() => manager.value.dragOperation)
    );

    const source = computed(() => trackedDragOperation.value.source ?? null);

    // Register overlay element and dropAnimation with the Feedback plugin
    watchEffect(() => {
      const el = overlayRef.value;
      const mgr = manager.value;

      if (!el || !mgr || props.disabled) return;

      const feedback = mgr.plugins.find(
        (plugin): plugin is Feedback => plugin instanceof Feedback
      );

      if (!feedback) return;

      feedback.overlay = el;
      feedback.dropAnimation = props.dropAnimation;

      onUnmounted(() => {
        feedback.overlay = undefined;
        feedback.dropAnimation = undefined;
      });
    });

    // Provide a patched manager that prevents children from registering
    const patchedManager = computed(() => {
      const mgr = manager.value;

      if (!mgr) return mgr;

      const patchedRegistry = new Proxy(mgr.registry, {
        get(target, property) {
          if (property === 'register' || property === 'unregister') {
            return noop;
          }

          return target[property as keyof typeof target];
        },
      });

      return new Proxy(mgr, {
        get(target, property) {
          if (property === 'registry') {
            return patchedRegistry;
          }

          return target[property as keyof typeof target];
        },
      }) as DragDropManager;
    });

    provideDragDropContext(patchedManager);

    return () => {
      const hasSource = source.value != null && !props.disabled;

      return h(
        props.tag,
        {
          ref: overlayRef,
          'data-dnd-overlay': true,
        },
        hasSource ? slots.default?.({source: source.value}) : undefined
      );
    };
  },
});
