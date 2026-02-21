<script lang="ts">
  import type {Snippet} from 'svelte';
  import {onDestroy} from 'svelte';
  import type {DragDropEventHandlers} from '@dnd-kit/abstract';
  import {
    DragDropManager,
    defaultPreset,
    resolveCustomizable,
    type DragDropManagerInput,
    type Draggable,
    type Droppable,
  } from '@dnd-kit/dom';

  import {createRenderer} from './renderer.svelte.js';
  import {setDragDropContext} from './context.js';

  type Events = DragDropEventHandlers<Draggable, Droppable, DragDropManager>;

  interface Props extends DragDropManagerInput {
    manager?: DragDropManager;
    children?: Snippet;
    onBeforeDragStart?: Events['beforedragstart'];
    onDragStart?: Events['dragstart'];
    onDragMove?: Events['dragmove'];
    onDragOver?: Events['dragover'];
    onDragEnd?: Events['dragend'];
    onCollision?: Events['collision'];
  }

  let {
    manager: managerProp,
    plugins,
    sensors,
    modifiers,
    children,
    onBeforeDragStart,
    onDragStart,
    onDragMove,
    onDragOver,
    onDragEnd,
    onCollision,
  }: Props = $props();

  const {renderer, trackRendering} = createRenderer();

  // Create manager once; plugins/sensors/modifiers are synced reactively via $effect below
  const manager = managerProp ?? new DragDropManager({});

  manager.renderer = renderer;

  setDragDropContext(manager);

  $effect(() => {
    manager.plugins = resolveCustomizable(plugins, defaultPreset.plugins);
    manager.sensors = resolveCustomizable(sensors, defaultPreset.sensors);
    manager.modifiers = resolveCustomizable(modifiers, defaultPreset.modifiers);
  });

  $effect(() => {
    const cleanupFns: (() => void)[] = [];

    cleanupFns.push(
      manager.monitor.addEventListener('beforedragstart', (event, mgr) =>
        trackRendering(() => onBeforeDragStart?.(event, mgr))
      )
    );

    cleanupFns.push(
      manager.monitor.addEventListener('dragstart', (event, mgr) =>
        onDragStart?.(event, mgr)
      )
    );

    cleanupFns.push(
      manager.monitor.addEventListener('dragover', (event, mgr) =>
        trackRendering(() => onDragOver?.(event, mgr))
      )
    );

    cleanupFns.push(
      manager.monitor.addEventListener('dragmove', (event, mgr) =>
        trackRendering(() => onDragMove?.(event, mgr))
      )
    );

    cleanupFns.push(
      manager.monitor.addEventListener('dragend', (event, mgr) =>
        trackRendering(() => onDragEnd?.(event, mgr))
      )
    );

    cleanupFns.push(
      manager.monitor.addEventListener('collision', (event, mgr) =>
        onCollision?.(event, mgr)
      )
    );

    return () => cleanupFns.forEach((fn) => fn());
  });

  onDestroy(() => {
    if (!managerProp) {
      manager.destroy();
    }
  });
</script>

{@render children?.()}
