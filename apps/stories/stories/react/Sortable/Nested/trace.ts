import type {Collision} from '@dnd-kit/abstract';
import type {DragDropManager} from '@dnd-kit/dom';
import {isSortable} from '@dnd-kit/dom/sortable';
import type {DragDropEventHandlers} from '@dnd-kit/react';
import {untracked} from '@dnd-kit/state';

import {locate, type BoardNode} from './tree.ts';

type MoveEvent = Parameters<DragDropEventHandlers['onDragMove']>[0];
type EndEvent = Parameters<DragDropEventHandlers['onDragEnd']>[0];
const LIMIT = 1000;

function rectangle(
  rect?: {left: number; top: number; width: number; height: number} | null
) {
  return rect
    ? {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
    : null;
}

function treeSnapshot(
  items: BoardNode[],
  parent = 'board'
): {id: string; title: string; parent: string; index: number}[] {
  return items.flatMap((node, index) => [
    {id: node.id, title: node.title, parent, index},
    ...treeSnapshot(node.children ?? [], node.id),
  ]);
}

function location(items: BoardNode[], id: string | number | null | undefined) {
  if (id == null) return null;
  const entry = locate(items, String(id));
  return entry ? {parent: entry.parent ?? 'board', index: entry.index} : null;
}

function nativeInput(event?: Event | null) {
  if (!event) return null;
  return {
    type: event.type,
    ...('key' in event ? {key: event.key} : {}),
    ...('clientX' in event
      ? {
          x: (event as PointerEvent).clientX,
          y: (event as PointerEvent).clientY,
          pointerType: (event as PointerEvent).pointerType,
          buttons: (event as PointerEvent).buttons,
        }
      : {}),
  };
}

/** Story-only observation. Never recompute collisions, refresh shapes, or write drag state. */
export function createNestedTrace(getItems: () => BoardNode[]) {
  let manager: DragDropManager | undefined;
  let active = false;
  let frame = 0;
  let started = 0;
  let metadata: Record<string, unknown> = {};
  let initial: Record<string, unknown> | null = null;
  let ending: Record<string, unknown> | null = null;
  let initialGeometry: Record<string, unknown> | null = null;
  let total = 0;
  let inputSequence = 0;
  let lastInput: Record<string, unknown> | null = null;
  let entries: Record<string, unknown>[] = [];
  let counts: Record<string, number> = {};
  let lastFrame = '';
  let lastItems: BoardNode[] | undefined;
  const elapsed = () => Math.round((performance.now() - started) * 100) / 100;

  function collisions(values: Collision[]) {
    return untracked(() =>
      values.map(({id, priority, type, value}) => ({
        id,
        priority,
        type,
        value: Number.isFinite(value) ? value : String(value),
        shape: rectangle(
          manager?.registry.droppables.get(id)?.shape?.boundingRectangle
        ),
      }))
    );
  }

  function record(event: string, detail: Record<string, unknown> = {}) {
    if (!manager || (!initial && event !== 'dragstart')) return;
    return untracked(() => {
      const operation = manager!.dragOperation.snapshot();
      const {source, target, shape} = operation;
      const items = getItems();
      const row = {
        sequence: ++total,
        milliseconds: elapsed(),
        event,
        inputSequence,
        lastInput,
        source: source?.id ?? null,
        target: target?.id ?? null,
        observerTarget: manager!.collisionObserver.collisions[0]?.id ?? null,
        observerDisabled: manager!.collisionObserver.disabled,
        status: manager!.dragOperation.status.current,
        point: {...operation.position.current},
        transform: {...operation.transform},
        sourceLocation: location(items, source?.id),
        targetLocation: location(items, target?.id),
        sortable: isSortable(source)
          ? {group: source.sortable.group, index: source.sortable.index}
          : null,
        shapes: {
          initial: rectangle(shape?.initial.boundingRectangle),
          current: rectangle(shape?.current.boundingRectangle),
          target: rectangle(target?.shape?.boundingRectangle),
        },
        ...detail,
      };
      // Ring buffer: retain the latest events without shifting the array in a loop.
      entries[(total - 1) % LIMIT] = row;
      counts[event] = (counts[event] ?? 0) + 1;
      return row;
    });
  }

  function sampleFrame() {
    if (!active || !manager) return;
    untracked(() => {
      const {source} = manager!.dragOperation;
      const sample = {
        scroll: {x: window.scrollX, y: window.scrollY},
        sourceDOM: rectangle(source?.element?.getBoundingClientRect()),
        collisions: collisions(manager!.collisionObserver.collisions),
        droppables: Array.from(manager!.registry.droppables, (entry) => ({
          id: entry.id,
          connected: entry.element?.isConnected ?? false,
          disabled: entry.disabled,
          acceptsSource: source ? entry.accepts(source) : null,
          proxy: Boolean(entry.proxy),
          domParent:
            entry.element?.parentElement
              ?.closest('[data-board-node]')
              ?.getAttribute('data-board-node') ?? null,
          shape: rectangle(entry.shape?.boundingRectangle),
          dom: rectangle(entry.element?.getBoundingClientRect()),
        })),
        animations: document.getAnimations().map((animation) => {
          const effect = animation.effect;
          const element =
            effect instanceof KeyframeEffect ? effect.target : null;
          return {
            node:
              element
                ?.closest('[data-board-node]')
                ?.getAttribute('data-board-node') ?? null,
            state: animation.playState,
            pending: animation.pending,
            time:
              typeof animation.currentTime === 'number'
                ? animation.currentTime
                : String(animation.currentTime),
            progress: effect?.getComputedTiming().progress ?? null,
          };
        }),
      };
      const serialized = JSON.stringify(sample);
      if (serialized !== lastFrame) {
        lastFrame = serialized;
        const row = record('frame', sample);
        initialGeometry ??= row ?? null;
      }
    });
    frame = requestAnimationFrame(sampleFrame);
  }

  const trace = {
    start(nextManager: DragDropManager) {
      cancelAnimationFrame(frame);
      manager = nextManager;
      active = true;
      started = performance.now();
      initial = ending = initialGeometry = null;
      total = inputSequence = 0;
      lastInput = null;
      entries = [];
      counts = {};
      lastFrame = '';
      lastItems = getItems();
      metadata = {
        startedAt: new Date().toISOString(),
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
        userAgent: navigator.userAgent,
      };
      initial = record('dragstart', {
        tree: treeSnapshot(lastItems),
        activator: nativeInput(manager.dragOperation.activatorEvent),
      })!;
      frame = requestAnimationFrame(sampleFrame);
    },
    move(event: MoveEvent) {
      if (!active) return;
      inputSequence++;
      lastInput = {
        milliseconds: elapsed(),
        to: event.to ? {...event.to} : null,
        by: event.by ? {...event.by} : null,
        native: nativeInput(event.nativeEvent),
      };
      record('dragmove');
    },
    collision(values: Collision[]) {
      if (active) record('collision', {collisions: collisions(values)});
    },
    over(next: BoardNode[]) {
      if (!active || !manager) return;
      untracked(() => {
        const sourceId = manager!.dragOperation.source?.id;
        const from = location(getItems(), sourceId);
        const to = location(next, sourceId);
        record('dragover', {
          placement: {
            from,
            to,
            changed: from?.parent !== to?.parent || from?.index !== to?.index,
          },
        });
      });
    },
    commit() {
      if (!active) return;
      const items = getItems();
      if (items !== lastItems) {
        lastItems = items;
        record('layout', {tree: treeSnapshot(items)});
      }
    },
    end(event: EndEvent) {
      if (!active) return;
      ending = record('dragend', {
        canceled: event.canceled,
        tree: treeSnapshot(getItems()),
      })!;
      active = false;
      cancelAnimationFrame(frame);
    },
    snapshot() {
      const offset = total > LIMIT ? total % LIMIT : 0;
      return {
        schema: 'dnd-kit/nested-collections-trace@1',
        ...metadata,
        active,
        limit: LIMIT,
        totalEvents: total,
        omittedEvents: Math.max(0, total - LIMIT),
        counts: {...counts},
        initial,
        initialGeometry,
        ending,
        notes:
          'Collision events are published notifications, not every computation. observerTarget reads the latest computed winner. Frame samples read DOM rectangles once per animation frame. No collision recomputation or geometry refresh is requested by the trace. Starting another drag replaces this trace.',
        events: [...entries.slice(offset), ...entries.slice(0, offset)],
      };
    },
    export() {
      return JSON.stringify(trace.snapshot(), null, 2);
    },
    attach() {
      window.__nestedCollectionsTrace = trace;
      const onScroll = (event: Event) => {
        if (!active) return;
        const element =
          event.target instanceof Element
            ? event.target
            : document.scrollingElement;
        record('scroll', {
          scroll: {x: element?.scrollLeft, y: element?.scrollTop},
          node:
            element
              ?.closest('[data-board-node]')
              ?.getAttribute('data-board-node') ?? null,
        });
      };
      const onResize = () => {
        if (active)
          record('resize', {
            viewport: {width: window.innerWidth, height: window.innerHeight},
          });
      };
      document.addEventListener('scroll', onScroll, {
        capture: true,
        passive: true,
      });
      window.addEventListener('resize', onResize);
      return () => {
        active = false;
        cancelAnimationFrame(frame);
        document.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onResize);
        if (window.__nestedCollectionsTrace === trace)
          delete window.__nestedCollectionsTrace;
      };
    },
  };
  return trace;
}

export type NestedTrace = ReturnType<typeof createNestedTrace>;

declare global {
  interface Window {
    __nestedCollectionsTrace?: NestedTrace;
  }
}
