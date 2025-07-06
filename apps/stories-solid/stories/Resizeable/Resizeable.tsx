import { createSignal, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { For, Show } from 'solid-js/web';
import type { JSX } from 'solid-js';
import type { UniqueIdentifier } from '@dnd-kit/abstract';
import { DragDropProvider, useDraggable } from '@dnd-kit/solid';

import './Resizeable.css';
import { Coordinates } from '@dnd-kit/geometry';
import { classNames } from '../../utilities';

interface Layout {
  /** @x integer that represents the number of grid cells from the left edge */
  x: number;
  /** @y integer that represents the number of grid cells from the top edge */
  y: number;
  /** @z integer that represents the stacking order of the item */
  z: number;
  /** @width Integer that represents the number of grid cells representing the width of the item */
  width: number;
  /** @height Integer that represents the number of grid cells representing the height of the item */
  height: number;
}

interface State {
  layouts: Record<UniqueIdentifier, Layout>;
}

interface GridArea {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
}

function toGridArea({ x, y, width, height }: Layout): GridArea {
  return {
    columnStart: x,
    columnEnd: x + width,
    rowStart: y,
    rowEnd: y + height,
  };
}

function toString({ rowStart, columnStart, rowEnd, columnEnd }: GridArea) {
  return `${rowStart}/${columnEnd}/${rowEnd}/${columnStart}`;
}

const CELL_WIDTH = 56;
const ROW_HEIGHT = 35;

type Action =
  | {
      type: 'move';
      id: UniqueIdentifier;
      data: Coordinates;
    }
  | {
      type: 'resize';
      id: UniqueIdentifier;
      data: ResizeEvent;
    };

function sanitize(layout: Layout): Layout {
  const { x, y, z, width, height } = layout;
  return {
    ...layout,
    x: Math.min(Math.max(x, 1), CELL_WIDTH - (x + width)),
    y: Math.max(y, 1),
    z: Math.max(z, 0),
    width,
    height,
  };
}

function move(layout: Layout, coordinates: Coordinates): Layout {
  const { x, y } = coordinates;
  return sanitize({
    ...layout,
    x: layout.x + x,
    y: layout.y + y,
  });
}

function resize(layout: Layout, data: ResizeEvent): Layout {
  const { x, y, width, height } = data;
  return sanitize({
    ...layout,
    width: layout.width + width,
    height: layout.height + height,
    x: layout.x + x,
    y: layout.y + y,
  });
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'move': {
      const { id, data } = action;
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [id]: move(state.layouts[id], data),
        },
      };
    }
    case 'resize': {
      const { id, data } = action;
      return {
        ...state,
        layouts: {
          ...state.layouts,
          [id]: resize(state.layouts[id], data),
        },
      };
    }
  }
  return state;
}

export function App() {
  const [selectedIds, setSelectedIds] = createSignal<UniqueIdentifier[] | null>(null);
  const [draggingIds, setDraggingIds] = createSignal<UniqueIdentifier[] | null>(null);
  const isDragging = () => draggingIds() != null;

  const [state, setState] = createStore<State>({
    layouts: {
      A: {
        x: 2,
        y: 3,
        z: 0,
        width: 6,
        height: 3,
      },
      B: {
        x: 3,
        y: 10,
        z: 0,
        width: 4,
        height: 2,
      },
    },
  });
  const layouts = () => state.layouts;

  function dispatch(action: Action) {
    setState((prev: State) => reducer(prev, action));
  }

  const handleMove = (id: UniqueIdentifier, coordinates: Coordinates) => {
    dispatch({ type: 'move', id, data: coordinates });
  };

  const handleResize = (id: UniqueIdentifier, data: ResizeEvent) => {
    dispatch({ type: 'resize', id, data });
  };

  return (
    <DragDropProvider
      onDragStart={(manager: any) => {
        if (selectedIds()?.length) {
          // manager.actions.initalize(selectedIds); // TODO: update for solid
        }
        // Use 'operation' instead of 'dragOperation' for solid
        setDraggingIds(manager.operation?.selectedIds);
        setSelectedIds(manager.operation?.selectedIds);
      }}
      onDragEnd={() => setDraggingIds(null)}
    >
      <Grid reveal={isDragging()} onClick={() => setSelectedIds(null)}>
        <For each={Object.entries(layouts())}>{([id, layout]) => (
          <GridItem
            id={id}
            layout={layout as Layout}
            onMove={handleMove}
            onResize={handleResize}
            onSelect={(id, shiftKey) =>
              setSelectedIds((ids) => (shiftKey ? [id, ...(ids ?? [])] : [id]))
            }
            dragging={!!draggingIds()?.includes(id)}
            selected={!!selectedIds()?.includes(id)}
          >
            Lorem ipsum dolor sit amet
          </GridItem>
        )}</For>
      </Grid>
    </DragDropProvider>
  );
}

interface GridProps {
  reveal?: boolean;
  onClick?: () => void;
  children?: any;
}

function Grid(props: GridProps) {
  const className = classNames('Grid', props.reveal && 'reveal');
  return (
    <div class={className} onClick={props.onClick}>
      {props.children}
    </div>
  );
}

interface GridItemProps {
  id: UniqueIdentifier;
  layout: Layout;
  selected?: boolean;
  dragging?: boolean;
  onMove: (id: UniqueIdentifier, coordinates: Coordinates) => void;
  onSelect: (id: UniqueIdentifier, shiftKey: boolean) => void;
  onResize: (id: UniqueIdentifier, event: ResizeEvent) => void;
  children?: any;
}

function GridItem(props: GridItemProps) {
  const draggable = useDraggable({
    element: undefined,
    id: props.id,
  });
  // TODO Whats this?
  const getTransform = () => draggable.transform;
  const x = () => getTransform() ? Math.ceil(getTransform().x / CELL_WIDTH) : null;
  const y = () => getTransform() ? Math.ceil(getTransform().y / ROW_HEIGHT) : null;
  let previous = { x: x(), y: y() };
  const showResizeControls = () => props.selected && !props.dragging;

  createEffect(() => {
    if (
      x() === null ||
      y() === null ||
      (x() === previous.x && y() === previous.y)
    ) {
      previous = { x: x(), y: y() };
      return;
    }
    const previousX = previous.x ?? 0;
    const previousY = previous.y ?? 0;
    props.onMove(props.id, { x: x()! - previousX, y: y()! - previousY });
    previous = { x: x(), y: y() };
  });

  const className = classNames('GridItem', props.selected && 'selected');

  return (
    <div
      ref={el => draggable.handleRef(el)}
      class={className}
      style={{ 'grid-area': toString(toGridArea(props.layout)) }}
      onClick={e => {
        e.stopPropagation();
        props.onSelect(props.id, (e as MouseEvent).shiftKey);
      }}
    >
      {props.children}
      <Resizeable
        disabled={!showResizeControls()}
        onResize={event => props.onResize(props.id, event)}
      />
    </div>
  );
}

interface ResizeEvent {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeableProps {
  disabled?: boolean;
  onResize: (event: ResizeEvent) => void;
}

const DIRECTIONS: Direction[] = ['NE', 'N', 'NW', 'E', 'W', 'SE', 'S', 'SW'];

type Direction = 'NE' | 'N' | 'NW' | 'SE' | 'S' | 'SW' | 'E' | 'W';

export function Resizeable(props: ResizeableProps) {
  return (
    <DragDropProvider>
      <Show when={!props.disabled}>
        <For each={DIRECTIONS}>
          {direction => <Handle direction={direction} onResize={props.onResize} />}
        </For>
      </Show>
    </DragDropProvider>
  );
}

interface HandleProps {
  direction: Direction;
  onResize: (event: ResizeEvent) => void;
}

function Handle(props: HandleProps) {
  const draggable = useDraggable({
    element: undefined,
    id: props.direction,
    type: 'handle',
  });
  const getTransform = () => (draggable as any).transform;
  let previousTransform = getTransform();
  let previous = { x: 0, y: 0 };

  createEffect(() => {
    if (
      JSON.stringify(getTransform()) === JSON.stringify(previousTransform)
    ) {
      return;
    }
    previousTransform = getTransform();
    if (!getTransform()) {
      return;
    }
    const x = Math.ceil(getTransform().x / CELL_WIDTH) - previous.x;
    const y = Math.ceil(getTransform().y / ROW_HEIGHT) - previous.y;
    previous.x = x;
    previous.y = x;
    const delta = {
      width: x,
      height: y,
      x: 0,
      y: 0,
    };
    if (props.direction.includes('N')) {
      delta.y = y;
      delta.height = -1 * y;
    }
    if (props.direction.includes('W')) {
      delta.x = x;
      delta.width = -1 * x;
    }
    switch (props.direction) {
      case 'N':
      case 'S':
        delta.width = 0;
        break;
      case 'E':
      case 'W':
        delta.height = 0;
        break;
    }
    props.onResize(delta);
  });

  return <span class="Handle" data-direction={props.direction} ref={el => draggable.handleRef(el)} />;
}