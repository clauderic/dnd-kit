import {DragDropEvents} from '@dnd-kit/abstract';
import {
  defaultPreset,
  DragDropManagerInput,
  Draggable,
  Droppable,
} from '@dnd-kit/dom';
import {DragDropManager} from '@dnd-kit/dom';
import {
  computed,
  defineComponent,
  onUnmounted,
  onWatcherCleanup,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';
import {useRenderer} from './renderer.ts';
import {provideDragDropContext} from './context.ts';

type NamedTuple<T extends (...args: any) => any> = T extends (
  ...args: infer A
) => any
  ? A
  : never;

type ToVueEmits<T extends Record<string, (...args: any) => any>> = {
  [K in keyof T]: NamedTuple<T[K]>;
};

type Events = ToVueEmits<DragDropEvents<Draggable, Droppable, DragDropManager>>;

export interface DragDropProviderProps extends DragDropManagerInput {
  manager?: DragDropManager;
}

export type DragDropProviderEmits = {
  beforeDragStart: Events['beforedragstart'];
  collision: Events['collision'];
  dragStart: Events['dragstart'];
  dragMove: Events['dragmove'];
  dragOver: Events['dragover'];
  dragEnd: Events['dragend'];
};

export default /* #__PURE__ */ defineComponent<DragDropProviderProps>({
  props: [
    'manager',
    'plugins',
    'sensors',
    'modifiers',
    'renderer',
  ] as unknown as undefined,
  emits: [
    'beforeDragStart',
    'collision',
    'dragStart',
    'dragMove',
    'dragOver',
    'dragEnd',
  ] as unknown as DragDropProviderEmits,
  setup(props, {emit, slots}) {
    const {renderer, trackRendering} = useRenderer();
    const manager = shallowRef(props.manager ?? new DragDropManager(props));

    watch(
      [() => props.manager],
      () => {
        const _manager = props.manager ?? new DragDropManager(props);
        const cleanupFns: (() => void)[] = [];

        _manager.renderer = renderer;

        cleanupFns.push(
          _manager.monitor.addEventListener(
            'beforedragstart',
            (event, manager) =>
              trackRendering(() => emit('beforeDragStart', event, manager))
          )
        );

        cleanupFns.push(
          _manager.monitor.addEventListener('dragstart', (event, manager) =>
            emit('dragStart', event, manager)
          )
        );

        cleanupFns.push(
          _manager.monitor.addEventListener('dragover', (event, manager) =>
            trackRendering(() => emit('dragOver', event, manager))
          )
        );

        cleanupFns.push(
          _manager.monitor.addEventListener('dragmove', (event, manager) =>
            trackRendering(() => emit('dragMove', event, manager))
          )
        );

        cleanupFns.push(
          _manager.monitor.addEventListener('dragend', (event, manager) =>
            trackRendering(() => emit('dragEnd', event, manager))
          )
        );

        cleanupFns.push(
          _manager.monitor.addEventListener('collision', (event, manager) =>
            emit('collision', event, manager)
          )
        );

        manager.value = _manager;

        onWatcherCleanup(() => cleanupFns.forEach((fn) => fn()));
      },
      {
        immediate: true,
      }
    );

    watchEffect(() => {
      manager.value.plugins = props.plugins ?? defaultPreset.plugins;
      manager.value.sensors = props.sensors ?? defaultPreset.sensors;
      manager.value.modifiers = props.modifiers ?? defaultPreset.modifiers;
    });

    provideDragDropContext(computed(() => manager.value));

    onUnmounted(() => {
      if (!props.manager) {
        manager.value.destroy();
      }
    });

    return () => slots.default?.();
  },
});
