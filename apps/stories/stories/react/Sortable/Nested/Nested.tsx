import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {CSSProperties, PropsWithChildren} from 'react';
import {CollisionPriority} from '@dnd-kit/abstract';
import {Feedback} from '@dnd-kit/dom';
import {isKeyboardEvent} from '@dnd-kit/dom/utilities';
import {DragDropProvider, useDroppable} from '@dnd-kit/react';
import type {DragDropEventHandlers} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';

import {Handle} from '../../components/index.ts';
import {initialItems, locate, moveNode, type BoardNode} from './tree.ts';
import {createNestedTrace} from './trace.ts';
import {TraceControls} from './TraceControls.tsx';
import {
  TRANSFER_DELAY,
  useContainerHover,
  type ContainerHover,
} from './useContainerHover.ts';
import styles from './Nested.module.css';

const ROOT = 'board';
const contentsId = (id: string) => `contents:${id}`;
const acceptedTypes = ['card', 'collection'];
const HoverContext = createContext<ContainerHover | null>(null);
type Operation = Parameters<
  DragDropEventHandlers['onDragOver']
>[0]['operation'];

function sort(items: BoardNode[], operation: Operation) {
  const {source, target} = operation;
  if (!source || !target || source.id === target.id) return items;
  const from = locate(items, String(source.id));
  const to = locate(items, String(target.id));
  if (!from) return items;

  if (to) {
    // A collection's header reorders it; its contents accept children.
    let index = to.index;
    if (
      from.parent !== to.parent &&
      !isKeyboardEvent(operation.activatorEvent)
    ) {
      const rect = target.shape?.boundingRectangle;
      if (!rect) return items;
      const point = operation.position.current;
      index += Number(
        to.parent === null && window.matchMedia('(min-width: 701px)').matches
          ? point.x > rect.left + rect.width / 2
          : point.y > rect.top + rect.height / 2
      );
    }
    return moveNode(items, from.node.id, to.parent, index);
  }

  const id = String(target.id);
  if (id === ROOT) return moveNode(items, from.node.id, null, items.length);
  if (!id.startsWith('contents:')) return items;
  const parent = locate(items, id.slice('contents:'.length))?.node;
  // Hovering a group's background preserves the position of its own children.
  // Sibling targets reorder them; this region only transfers from another group.
  return parent?.children && from.parent !== parent.id
    ? moveNode(items, from.node.id, parent.id, parent.children.length)
    : items;
}

export function Nested({
  transferDelay = TRANSFER_DELAY,
}: {
  transferDelay?: number;
}) {
  const [items, setItems] = useState(initialItems);
  const current = useRef(items);
  const snapshot = useRef(items);
  const [dragging, setDragging] = useState(false);
  const [trace] = useState(() => createNestedTrace(() => current.current));
  const hover = useContainerHover(current, transferDelay);

  useEffect(() => trace.attach(), [trace]);
  useLayoutEffect(() => trace.commit(), [items, trace]);

  function update(next: BoardNode[]) {
    current.current = next;
    setItems(next);
  }

  return (
    <div className={styles.Example} data-nested-board data-dragging={dragging}>
      <header className={styles.Intro}>
        <div>
          <div className={styles.Eyebrow}>
            <span /> THE WORKSPACE
          </div>
          <h1>Good things take shape.</h1>
          <p>A place for the big picture. And all the little details.</p>
        </div>
        <div className={styles.Toolbar}>
          <TraceControls trace={trace} />
          <button
            className={styles.Reset}
            disabled={dragging}
            onClick={() => update(initialItems())}
          >
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 7a6.5 6.5 0 1 1-.3 5M4 3v4h4" />
            </svg>
            Reset board
          </button>
        </div>
      </header>
      <DragDropProvider
        onDragStart={(_, manager) => {
          hover.start(manager);
          trace.start(manager, transferDelay);
          snapshot.current = current.current;
          setDragging(true);
        }}
        onDragMove={(event) => trace.move(event)}
        onCollision={(event, manager) => {
          trace.collision(event.collisions);
          hover.collision(event, manager);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          hover.clear();
          const next = sort(current.current, event.operation);
          trace.over(next);
          update(next);
        }}
        onDragEnd={(event) => {
          hover.end();
          trace.end(event);
          if (event.canceled) update(snapshot.current);
          setDragging(false);
        }}
      >
        <HoverContext.Provider value={hover.preview}>
          <Contents id={ROOT} label="the board" root empty={items.length === 0}>
            <Nodes items={items} parent={null} depth={0} />
          </Contents>
        </HoverContext.Provider>
      </DragDropProvider>
      <footer className={styles.Footer}>
        <span>
          <Grip /> Drag to reorder. Hold over a collection to move inside.
        </span>
        <span>
          <kbd>Space</kbd> pick up / drop{' '}
          <span className={styles.Separator}>·</span> <kbd>↑</kbd>
          <kbd>↓</kbd>
          <kbd>←</kbd>
          <kbd>→</kbd> move <span className={styles.Separator}>·</span>{' '}
          <kbd>Esc</kbd> cancel
        </span>
      </footer>
    </div>
  );
}

function Nodes({
  items,
  parent,
  depth,
}: {
  items: BoardNode[];
  parent: string | null;
  depth: number;
}) {
  return items.map((node, index) => (
    <Node
      key={node.id}
      node={node}
      index={index}
      parent={parent}
      depth={depth}
    />
  ));
}

function Node({
  node,
  index,
  parent,
  depth,
}: {
  node: BoardNode;
  index: number;
  parent: string | null;
  depth: number;
}) {
  const collection = node.children != null;
  const {ref, targetRef, handleRef, isDragging, isDragSource} = useSortable({
    id: node.id,
    index,
    group: parent ? contentsId(parent) : ROOT,
    type: collection ? 'collection' : 'card',
    accept: acceptedTypes,
    plugins: (defaults) => [
      ...defaults,
      Feedback.configure({feedback: 'clone'}),
    ],
  });

  return (
    <div
      ref={ref}
      className={collection ? styles.Collection : styles.Card}
      style={{'--accent': node.color} as CSSProperties}
      role="listitem"
      data-board-node={node.id}
      data-parent={parent ?? ROOT}
      data-depth={depth}
      data-source={isDragSource}
      data-dragging={isDragging}
    >
      <div
        ref={collection ? targetRef : undefined}
        className={styles.NodeHeader}
      >
        {collection ? (
          <span className={styles.CollectionIcon}>
            <Folder />
          </span>
        ) : (
          <span className={styles.Check} aria-hidden="true" />
        )}
        <span className={styles.Title}>{node.title}</span>
        {collection && (
          <span
            className={styles.Count}
            aria-label={`${node.children!.length} items`}
          >
            {node.children!.length}
          </span>
        )}
        <Handle ref={handleRef} aria-label={`Drag ${node.title}`} />
      </div>
      {collection ? (
        <Contents
          id={contentsId(node.id)}
          label={node.title}
          empty={!node.children!.length}
        >
          <Nodes items={node.children!} parent={node.id} depth={depth + 1} />
        </Contents>
      ) : (
        <div className={styles.CardFooter}>
          <span className={styles.Tag}>{node.tag}</span>
          <span className={styles.CardMeta}>
            {node.note && <span className={styles.Note}>{node.note}</span>}
            <span
              className={styles.Avatar}
              aria-label={`Assigned to ${node.owner}`}
            >
              {node.owner
                ?.split(' ')
                .map((name) => name[0])
                .join('')}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

function Contents({
  id,
  label,
  root,
  empty,
  children,
}: PropsWithChildren<{
  id: string;
  label: string;
  root?: boolean;
  empty: boolean;
}>) {
  const hover = useContext(HoverContext);
  const pending =
    hover?.parent === (root ? null : id.slice('contents:'.length));
  const {ref, isDropTarget} = useDroppable({
    id,
    type: 'contents',
    accept: acceptedTypes,
    collisionPriority: root ? CollisionPriority.Lowest : undefined,
  });

  return (
    <div
      ref={root ? undefined : ref}
      role="list"
      aria-label={label}
      className={root ? styles.Board : styles.Contents}
      data-board-contents={id}
      data-over={isDropTarget}
      data-pending={pending}
    >
      {pending && (
        <div
          key={hover.startedAt}
          className={styles.TransferCue}
          style={{'--transfer-delay': `${hover.duration}ms`} as CSSProperties}
          role="status"
          data-transfer-cue={id}
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle className={styles.TransferTrack} cx="10" cy="10" r="7" />
            <circle
              className={styles.TransferProgress}
              cx="10"
              cy="10"
              r="7"
              pathLength="1"
            />
          </svg>
          <span>Move into {label}</span>
        </div>
      )}
      {children}
      <div
        ref={root ? ref : undefined}
        className={empty ? styles.Empty : styles.Append}
        data-board-append={id}
      >
        {empty ? (
          <>
            <span className={styles.EmptyIcon}>
              <Folder />
            </span>
            <strong>Room for something good</strong>
            <span>Drop a card or collection here</span>
          </>
        ) : (
          <>
            <span aria-hidden="true">+</span> Move into {label}
          </>
        )}
      </div>
    </div>
  );
}

function Folder() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2.5 6V4.5A1.5 1.5 0 0 1 4 3h3.5L10 5h6a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 16 16H4a1.5 1.5 0 0 1-1.5-1.5V6Zm0 1h15" />
    </svg>
  );
}

function Grip() {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="currentColor"
      aria-hidden="true"
    >
      {[4, 8, 12].flatMap((cy) =>
        [4, 8].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1" />)
      )}
    </svg>
  );
}
