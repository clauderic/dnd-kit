import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import type {Collision} from '@dnd-kit/abstract';
import {Feedback} from '@dnd-kit/dom';
import type {DragDropManager} from '@dnd-kit/dom';
import {DragDropProvider, useDroppable} from '@dnd-kit/react';
import type {DragDropEventHandlers} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {untracked} from '@dnd-kit/state';

import styles from './NestedReproductions.module.css';

type Scenario =
  | 'puck-grid'
  | 'nested-lists'
  | 'variable-size'
  | 'own-descendant';
type Layout = 'grid' | 'lists';
type Point = {x: number; y: number};
type Rect = {x: number; y: number; width: number; height: number};
type Operation = Parameters<
  DragDropEventHandlers['onDragOver']
>[0]['operation'];
type ItemNode = {
  id: string;
  label: string;
  kind: 'item' | 'container';
  items?: ItemNode[];
};
type Tree = {id: string; items: ItemNode[]};
type Location = {
  node: ItemNode;
  group: string;
  index: number;
  ancestors: string[];
};

const ROOT = 'root:canvas';
const TRACE_LIMIT = 500;
const acceptedTypes = ['item', 'container'];
const childrenId = (id: string) => `children:${id}`;
function initialTree(layout: Layout): Tree {
  const card = (label: string): ItemNode => ({
    id: `item:${label}`,
    label,
    kind: 'item',
  });
  const group = (label: string, items: ItemNode[]): ItemNode => ({
    id: `container:${label}`,
    label,
    kind: 'container',
    items,
  });

  return {
    id: ROOT,
    items:
      layout === 'grid'
        ? [card('1'), card('2'), group('3', [card('3a'), card('3b')])]
        : [
            group('A', [
              group('A1', [card('A1.1'), card('A1.2'), card('A1.3')]),
              card('A2'),
              card('A3'),
            ]),
            group('B', [card('B1'), card('B2'), card('B3')]),
          ],
  };
}

function flatten(tree: Tree): Location[] {
  const result: Location[] = [];
  function visit(items: ItemNode[], group: string, ancestors: string[]) {
    items.forEach((node, index) => {
      result.push({node, group, index, ancestors});
      if (node.items)
        visit(node.items, childrenId(node.id), [...ancestors, node.id]);
    });
  }
  visit(tree.items, ROOT, []);
  return result;
}

function groupItems(tree: Tree, group: string): ItemNode[] | undefined {
  if (group === ROOT) return tree.items;
  return flatten(tree).find(({node}) => childrenId(node.id) === group)?.node
    .items;
}

function isOwnDescendant(
  tree: Tree,
  sourceId: string | undefined,
  targetId: string
) {
  if (!sourceId) return false;
  const target = flatten(tree).find(
    ({node}) => node.id === targetId || childrenId(node.id) === targetId
  );
  return Boolean(
    target &&
      (target.ancestors.includes(sourceId) ||
        (target.node.id === sourceId && targetId === childrenId(sourceId)))
  );
}

/** Only protects the application tree. Collision candidates and targets are never filtered. */
function nestedMove(tree: Tree, operation: Operation, layout: Layout) {
  const {source, target} = operation;
  const unchanged = (reason: string) => ({tree, reason});
  if (!source || !target) return unchanged('missing-source-or-target');
  const sourceId = String(source.id);
  const targetId = String(target.id);
  if (sourceId === targetId) return unchanged('self');
  if (isOwnDescendant(tree, sourceId, targetId))
    return unchanged('invalid-own-descendant');

  const locations = flatten(tree);
  const from = locations.find(({node}) => node.id === sourceId);
  const to = locations.find(({node}) => node.id === targetId);
  // A container header sorts the container as a sibling; its separate children zone appends inside it.
  const destination =
    to?.group ?? (groupItems(tree, targetId) ? targetId : undefined);
  if (!from || !destination) return unchanged('missing-node-or-group');
  let index = groupItems(tree, destination)!.length;

  if (to) {
    const rect = target.shape?.boundingRectangle;
    if (!rect) return unchanged('missing-target-shape');
    const horizontal = destination === ROOT && layout === 'lists';
    const point = operation.position.current;
    const after = horizontal
      ? point.x >= rect.left + rect.width / 2
      : point.y >= rect.top + rect.height / 2;
    index = to.index + Number(after);
  }
  if (from.group === destination && from.index < index) index -= 1;
  if (from.group === destination && from.index === index)
    return unchanged('same-slot');

  const next = structuredClone(tree);
  const fromItems = groupItems(next, from.group);
  const toItems = groupItems(next, destination);
  if (!fromItems || !toItems) return unchanged('missing-group');
  const [node] = fromItems.splice(from.index, 1);
  toItems.splice(index, 0, node);
  return {
    tree: next,
    reason: `${from.group}[${from.index}] -> ${destination}[${index}]`,
  };
}

function rectSnapshot(
  rect?: {left: number; top: number; width: number; height: number} | null
): Rect | null {
  return rect
    ? {x: rect.left, y: rect.top, width: rect.width, height: rect.height}
    : null;
}

interface TraceEntry {
  sequence: number;
  milliseconds: number;
  event: string;
  source: string | null;
  target: string | null;
  coordinates: Point | null;
  sourceGroup: string | null;
  targetGroup: string | null;
  ownDescendant: boolean;
  reason?: string;
  shapes: {
    initial: Rect | null;
    current: Rect | null;
    target: Rect | null;
    droppables: {
      id: string;
      group: string | null;
      owner: string | null;
      shape: Rect | null;
      dom: Rect | null;
      ownDescendant: boolean;
    }[];
  };
  collisions: {
    id: string;
    priority: number;
    type: number;
    value: number | string;
    ownDescendant: boolean;
  }[];
  tree: {id: string; group: string; index: number; ancestors: string[]}[];
}

type Trace = {scenario: Scenario; limit: number; events: TraceEntry[]};
type TraceWindow = Window & {__nestedCollisionTrace?: Trace};

const instructions: Record<Scenario, {title: string; steps: string[]}> = {
  'puck-grid': {
    title: 'Puck-style nested grid — PR #1610',
    steps: [
      'Drag 3a by its dotted handle onto the lower half of root item 2. The child leaves container 3 and widens from the nested list to a root grid cell.',
      'Drag it back onto the “Append inside 3” band. Pause just across that boundary, then reverse direction. Container 3 shrinks and grows as children transfer.',
      'The two-column root and vertical 3a/3b children follow #1610; this version adds explicit groups and root/children drop surfaces.',
    ],
  },
  'nested-lists': {
    title: 'Nested lists and root transfer — PR #1524',
    steps: [
      'Before pressing down, scroll until the A1.2 handle and right-hand “Append at root” band are both visible. Drag A1.2 out through A1 and A onto that band; its width changes at each nesting level.',
      'Return it to “Append inside A1”, then transfer A2 onto B2. Pause at each container edge and watch the feedback offset as the parents resize.',
      'A/B horizontal root groups and recursive A1 reproduce #1524. The root drop surface is enabled here so empty-root-space transfers are explicit.',
    ],
  },
  'variable-size': {
    title: 'Variable-size Puck-style blocks',
    steps: [
      'Drag tall root item 2 into “Append inside 3”: its height changes from 260 to 156 px and its width follows the nested group.',
      'Drag it back onto “Append at root”, then move tall 3b across short 3a. Pause without releasing after each transfer, then move 1 px.',
      'This extends #1610 with the varied block sizes called out in that PR. System fonts, no images and fixed dimensions keep the geometry deterministic.',
    ],
  },
  'own-descendant': {
    title: 'Container against its own descendants — PR #1524',
    steps: [
      'Select A, then drag its dotted header handle down through the original A1/A1.2 area. Also try A1 across its own cards and children append band.',
      'Inspect collision rows for ownDescendant: true, and dragover rows for invalid-own-descendant. The defensive move guard keeps the tree intact while leaving the detector result visible.',
      'Compare with A over B: that is a valid sibling reorder. Descendants stay mounted and enabled while their ancestor is dragged.',
    ],
  },
};

export function NestedReproductions({
  scenario = 'puck-grid',
}: {
  scenario?: Scenario;
}) {
  // Keying keeps changing Storybook args equivalent to Reset layout.
  return <Reproduction key={scenario} scenario={scenario} />;
}

function Reproduction({scenario}: {scenario: Scenario}) {
  const layout: Layout =
    scenario === 'puck-grid' || scenario === 'variable-size' ? 'grid' : 'lists';
  const [tree, setTree] = useState(() => initialTree(layout));
  const [selected, setSelected] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [traceView, setTraceView] = useState(
    'Drag a handle, then click Show latest trace.'
  );
  const treeRef = useRef(tree);
  const beforeDrag = useRef(tree);
  const managerRef = useRef<DragDropManager | null>(null);
  const trace = useRef<Trace>({scenario, limit: TRACE_LIMIT, events: []});
  const sequence = useRef(0);
  const statusRef = useRef<HTMLOutputElement>(null);
  const latestCollisions = useRef<Collision[]>([]);

  const record = useCallback(
    (
      event: string,
      manager?: DragDropManager | null,
      operation?: Operation,
      reason?: string
    ) => {
      // Collision callbacks run inside a library reactive effect. Observability must not add dependencies to it.
      untracked(() => {
        if (manager) managerRef.current = manager;
        const currentManager = manager ?? managerRef.current;
        const op = operation ?? currentManager?.dragOperation.snapshot();
        const source = op?.source;
        const target = op?.target;
        const sourceId = source ? String(source.id) : undefined;
        const currentTree = treeRef.current;
        const entries = trace.current.events;
        const entry: TraceEntry = {
          sequence: ++sequence.current,
          milliseconds: Math.round(performance.now() * 10) / 10,
          event,
          source: sourceId ?? null,
          target: target ? String(target.id) : null,
          coordinates: op ? {...op.position.current} : null,
          sourceGroup: source?.data.group ?? null,
          targetGroup: target?.data.group ?? null,
          ownDescendant: Boolean(
            target && isOwnDescendant(currentTree, sourceId, String(target.id))
          ),
          reason,
          shapes: {
            initial: rectSnapshot(op?.shape?.initial.boundingRectangle),
            current: rectSnapshot(op?.shape?.current.boundingRectangle),
            target: rectSnapshot(target?.shape?.boundingRectangle),
            droppables: currentManager
              ? Array.from(currentManager.registry.droppables).map(
                  (droppable) => ({
                    id: String(droppable.id),
                    group: droppable.data.group ?? null,
                    owner: droppable.data.owner ?? null,
                    shape: rectSnapshot(droppable.shape?.boundingRectangle),
                    dom: rectSnapshot(
                      droppable.element?.getBoundingClientRect()
                    ),
                    ownDescendant: isOwnDescendant(
                      currentTree,
                      sourceId,
                      String(droppable.id)
                    ),
                  })
                )
              : [],
          },
          collisions: latestCollisions.current.map(
            ({id, priority, type, value}) => ({
              id: String(id),
              priority,
              type,
              value: Number.isFinite(value) ? value : String(value),
              ownDescendant: isOwnDescendant(currentTree, sourceId, String(id)),
            })
          ),
          tree: flatten(currentTree).map(({node, group, index, ancestors}) => ({
            id: node.id,
            group,
            index,
            ancestors,
          })),
        };
        entries.push(entry);
        if (entries.length > TRACE_LIMIT)
          entries.splice(0, entries.length - TRACE_LIMIT);
        if (typeof window !== 'undefined')
          (window as TraceWindow).__nestedCollisionTrace = trace.current;
        if (statusRef.current) {
          statusRef.current.textContent = `#${entry.sequence} ${event}: ${entry.source ?? '—'} → ${entry.target ?? '—'}${reason ? ` | ${reason}` : ''} (${entries.length}/${TRACE_LIMIT})`;
        }
      });
    },
    []
  );

  useEffect(() => {
    const targetWindow = window as TraceWindow;
    targetWindow.__nestedCollisionTrace = trace.current;
    return () => {
      if (targetWindow.__nestedCollisionTrace === trace.current)
        delete targetWindow.__nestedCollisionTrace;
    };
  }, []);

  useLayoutEffect(() => {
    record('layout');
  }, [tree, record]);

  function updateTree(next: Tree) {
    treeRef.current = next;
    setTree(next);
  }

  const description = instructions[scenario];
  return (
    <div className={styles.Reproduction} data-nested-reproduction={scenario}>
      <header className={styles.Intro}>
        <h2>{description.title}</h2>
        <ol>
          {description.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>
          Click a label to select; drag its dotted handle. Escape restores the
          tree. Default collision detector, controlled moves on dragover, clone
          feedback, default sortable transitions.
        </p>
        <p>
          Sources:{' '}
          <a href="https://github.com/clauderic/dnd-kit/pull/1610">PR #1610</a>{' '}
          ·{' '}
          <a href="https://github.com/clauderic/dnd-kit/pull/1524">PR #1524</a>.
          Suggested viewport: 1440 × 1100 for the story iframe. On smaller
          previews, scroll the source handle into view before starting a drag
          and measure its coordinates after scrolling.
        </p>
        <div className={styles.Toolbar}>
          <button
            type="button"
            data-nested-reset
            disabled={active}
            onClick={() => {
              updateTree(initialTree(layout));
              setSelected(null);
              latestCollisions.current = [];
              record('reset');
            }}
          >
            Reset layout
          </button>
          <button
            type="button"
            onClick={() => {
              trace.current.events.length = 0;
              record('trace-cleared');
              setTraceView('Trace cleared.');
            }}
          >
            Clear trace
          </button>
          <button
            type="button"
            onClick={() =>
              setTraceView(
                JSON.stringify(trace.current.events.slice(-8), null, 2)
              )
            }
          >
            Show latest trace
          </button>
          <span data-nested-selection={selected ?? ''}>
            Selected: {selected ?? 'none'}
          </span>
        </div>
        <output
          ref={statusRef}
          className={styles.Status}
          data-nested-trace-status
        />
      </header>
      <DragDropProvider
        onDragStart={(event, manager) => {
          beforeDrag.current = treeRef.current;
          setActive(true);
          record('dragstart', manager, event.operation);
        }}
        onDragMove={(event, manager) =>
          record('dragmove', manager, event.operation)
        }
        onCollision={(event, manager) => {
          latestCollisions.current = event.collisions;
          record('collision', manager);
        }}
        onDragOver={(event, manager) => {
          event.preventDefault();
          const result = nestedMove(treeRef.current, event.operation, layout);
          record('dragover', manager, event.operation, result.reason);
          if (result.tree !== treeRef.current) updateTree(result.tree);
        }}
        onDragEnd={(event, manager) => {
          record(
            'dragend',
            manager,
            event.operation,
            event.canceled ? 'canceled: restoring snapshot' : 'committed'
          );
          if (event.canceled) updateTree(beforeDrag.current);
          setActive(false);
        }}
      >
        <DropZone id={ROOT} owner={null} layout={layout} label="Append at root">
          <Nodes
            items={tree.items}
            group={ROOT}
            depth={0}
            scenario={scenario}
            selected={selected}
            select={setSelected}
          />
        </DropZone>
      </DragDropProvider>
      <aside className={styles.TracePanel}>
        <p>
          Live JSON: <code>window.__nestedCollisionTrace.events</code> (latest{' '}
          {TRACE_LIMIT} events). Rows include coordinates, groups, ordered
          collision candidates, model ancestry, initial/current/target shapes
          and registered droppable DOM rectangles. “layout” follows a React tree
          commit; “collision” records library notifications, not every internal
          computation. Coordinates are viewport pixels.
        </p>
        <pre data-nested-trace-panel>{traceView}</pre>
      </aside>
    </div>
  );
}

interface NodesProps {
  items: ItemNode[];
  group: string;
  depth: number;
  scenario: Scenario;
  selected: string | null;
  select(id: string): void;
}

function Nodes({items, ...props}: NodesProps) {
  return items.map((node, index) => (
    <SortableNode key={node.id} node={node} index={index} {...props} />
  ));
}

function SortableNode({
  node,
  index,
  group,
  depth,
  scenario,
  selected,
  select,
}: Omit<NodesProps, 'items'> & {node: ItemNode; index: number}) {
  const {ref, handleRef, isDragSource, isDropTarget} = useSortable({
    id: node.id,
    index,
    group,
    type: node.kind,
    accept: acceptedTypes,
    data: {group, depth, kind: node.kind},
    collisionPriority:
      node.kind === 'container' ? CollisionPriority.Low : undefined,
    // Clone feedback matches #1524, expressed through the current plugin API.
    plugins: (defaults) => [
      ...defaults,
      Feedback.configure({feedback: 'clone'}),
    ],
  });
  const grid = scenario === 'puck-grid' || scenario === 'variable-size';
  let height = grid ? 180 : 56;
  if (scenario === 'variable-size') {
    const heights: Record<string, [number, number]> = {
      '1': [100, 72],
      '2': [260, 156],
      '3a': [64, 96],
      '3b': [220, 240],
    };
    height = heights[node.label]?.[depth === 0 ? 0 : 1] ?? height;
  }
  return (
    <section
      ref={ref}
      className={node.kind === 'container' ? styles.Container : styles.Item}
      style={{'--item-height': `${height}px`} as CSSProperties}
      data-nested-node={node.id}
      data-nested-kind={node.kind}
      data-nested-group={group}
      data-nested-index={index}
      data-nested-depth={depth}
      data-nested-selected={selected === node.id}
      data-nested-source={isDragSource}
      data-nested-target={isDropTarget}
    >
      <div className={styles.NodeHeader}>
        <button
          type="button"
          className={styles.Label}
          data-nested-select={node.id}
          onClick={() => select(node.id)}
        >
          {node.label}
        </button>
        <button
          type="button"
          ref={handleRef}
          className={styles.Handle}
          aria-label={`Drag ${node.label}`}
          data-nested-handle={node.id}
          onFocus={() => select(node.id)}
          onPointerDown={() => select(node.id)}
        >
          ⠿
        </button>
      </div>
      {node.items ? (
        <DropZone
          id={childrenId(node.id)}
          owner={node.id}
          label={`Append inside ${node.label}`}
        >
          <Nodes
            items={node.items}
            group={childrenId(node.id)}
            depth={depth + 1}
            scenario={scenario}
            selected={selected}
            select={select}
          />
        </DropZone>
      ) : (
        <div className={styles.ItemDetail}>
          {grid
            ? `${height}px tall · ${depth === 0 ? 'root' : `depth ${depth}`}`
            : group.replace('children:container:', 'in ')}
        </div>
      )}
    </section>
  );
}

function DropZone({
  id,
  owner,
  layout,
  label,
  children,
}: PropsWithChildren<{
  id: string;
  owner: string | null;
  layout?: Layout;
  label: string;
}>) {
  const {ref, isDropTarget} = useDroppable({
    id,
    type: owner ? 'children' : 'root',
    accept: acceptedTypes,
    collisionPriority: owner ? CollisionPriority.Low : CollisionPriority.Lowest,
    data: {group: id, owner},
  });
  return (
    <div
      ref={ref}
      className={owner ? styles.Children : styles.Root}
      data-nested-zone={id}
      data-nested-owner={owner ?? ''}
      data-nested-layout={layout ?? 'vertical'}
      data-nested-target={isDropTarget}
    >
      {children}
      <div className={styles.Append} data-nested-append={id}>
        {label}
      </div>
    </div>
  );
}
