import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useReducer,
  useRef,
} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/types';
import {DragDropProvider, useDraggable} from '@dnd-kit/react';

import './Resizeable.css';
import {Coordinates} from '@dnd-kit/geometry';

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

function toGridArea({x, y, width, height}: Layout): GridArea {
  return {
    columnStart: x,
    columnEnd: x + width,
    rowStart: y,
    rowEnd: y + height,
  };
}

function toString({rowStart, columnStart, rowEnd, columnEnd}: GridArea) {
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
  const {x, y, z, width, height} = layout;

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
  const {x, y} = coordinates;

  return sanitize({
    ...layout,
    x: layout.x + x,
    y: layout.y + y,
  });
}

function resize(layout: Layout, data: ResizeEvent): Layout {
  const {x, y, width, height} = data;

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
      const {id, data} = action;

      return {
        ...state,
        layouts: {
          ...state.layouts,
          [id]: move(state.layouts[id], data),
        },
      };
    }
    case 'resize': {
      const {id, data} = action;

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
  const [selectedIds, setSelectedIds] = useState<UniqueIdentifier[] | null>(
    null
  );
  const [draggingIds, setDraggingIds] = useState<UniqueIdentifier[] | null>(
    null
  );
  const isDragging = draggingIds != null;

  const [state, dispatch] = useReducer(reducer, {
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
  const {layouts} = state;

  const handleMove = useCallback(
    (id: UniqueIdentifier, coordinates: Coordinates) => {
      dispatch({type: 'move', id, data: coordinates});
    },
    []
  );

  const handleResize = useCallback(
    (id: UniqueIdentifier, data: ResizeEvent) => {
      dispatch({type: 'resize', id, data});
    },
    []
  );

  return (
    <DragDropProvider
      onDragStart={(manager) => {
        if (selectedIds?.length) {
          manager.actions.initalize(selectedIds);
        }

        setDraggingIds(manager.dragOperation.selectedIds);
        setSelectedIds(manager.dragOperation.selectedIds);
      }}
      onDragEnd={() => setDraggingIds(null)}
    >
      <Grid reveal={isDragging} onClick={() => setSelectedIds(null)}>
        {Object.entries(layouts).map(([id, layout]) => (
          <GridItem
            key={id}
            id={id}
            layout={layout}
            onMove={handleMove}
            onResize={handleResize}
            onSelect={(id, shiftKey) =>
              setSelectedIds((ids) => (shiftKey ? [id, ...(ids ?? [])] : [id]))
            }
            dragging={draggingIds?.includes(id)}
            selected={selectedIds?.includes(id)}
          >
            Lorem ipsum dolor sit amet
          </GridItem>
        ))}
      </Grid>
    </DragDropProvider>
  );
}

interface GridProps {
  reveal?: boolean;
  onClick?(): void;
}

function Grid({children, onClick, reveal}: PropsWithChildren<GridProps>) {
  const className = classNames('Grid', reveal && 'reveal');

  return (
    <div className={className} onClick={onClick}>
      {children}
    </div>
  );
}

interface GridItemProps {
  id: UniqueIdentifier;
  layout: Layout;
  selected?: boolean;
  dragging?: boolean;
  onMove(id: UniqueIdentifier, coordinates: Coordinates): void;
  onSelect(id: UniqueIdentifier, shiftKey: boolean): void;
  onResize(id: UniqueIdentifier, event: ResizeEvent): void;
}

function GridItem({
  id,
  layout,
  children,
  dragging,
  selected,
  onMove,
  onSelect,
  onResize,
}: PropsWithChildren<GridItemProps>) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const {transform} = useDraggable({
    activator: ref,
    element: null,
    id,
  });
  const x = transform ? Math.ceil(transform.x / CELL_WIDTH) : null;
  const y = transform ? Math.ceil(transform.y / ROW_HEIGHT) : null;
  const previous = useRef({x, y});
  const showResizeControls = selected && !dragging;

  useLayoutEffect(() => {
    if (
      x === null ||
      y === null ||
      (x === previous.current.x && y === previous.current.y)
    ) {
      previous.current = {x, y};
      return;
    }

    const previousX = previous.current.x ?? 0;
    const previousY = previous.current.y ?? 0;

    onMove(id, {x: x - previousX, y: y - previousY});

    previous.current = {x, y};
  }, [x, y]);

  const className = classNames('GridItem', selected && 'selected');

  return (
    <div
      ref={setRef}
      className={className}
      style={{
        gridArea: toString(toGridArea(layout)),
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id, event.shiftKey);
      }}
    >
      {children}
      <Resizeable
        disabled={!showResizeControls}
        onResize={(event) => onResize(id, event)}
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
  onResize(event: ResizeEvent): void;
}

const DIRECTIONS: Direction[] = ['NE', 'N', 'NW', 'E', 'W', 'SE', 'S', 'SW'];

export function Resizeable({disabled, onResize}: ResizeableProps) {
  const handles = disabled ? null : (
    <>
      {DIRECTIONS.map((direction) => (
        <Handle key={direction} direction={direction} onResize={onResize} />
      ))}
    </>
  );

  return <DragDropProvider>{handles}</DragDropProvider>;
}

type Direction = 'NE' | 'N' | 'NW' | 'SE' | 'S' | 'SW' | 'E' | 'W';

interface HandleProps {
  direction: Direction;
  onResize(event: ResizeEvent): void;
}

function Handle({direction, onResize}: HandleProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const {transform} = useDraggable({
    activator: ref,
    element: null,
    id: direction,
    type: 'handle',
  });
  const previousTransform = useRef(transform);
  const previous = useRef({x: 0, y: 0});

  useEffect(() => {
    if (
      JSON.stringify(transform) === JSON.stringify(previousTransform.current)
    ) {
      return;
    }

    previousTransform.current = transform;

    if (!transform) {
      return;
    }

    const x = Math.ceil(transform.x / CELL_WIDTH) - previous.current.x;
    const y = Math.ceil(transform.y / ROW_HEIGHT) - previous.current.y;

    previous.current.x = x;
    previous.current.y = x;

    const delta = {
      width: x,
      height: y,
      x: 0,
      y: 0,
    };

    if (direction.includes('N')) {
      delta.y = y;
      delta.height = -1 * y;
    }

    if (direction.includes('W')) {
      delta.x = x;
      delta.width = -1 * x;
    }

    switch (direction) {
      case 'N':
      case 'S':
        delta.width = 0;
        break;
      case 'E':
      case 'W':
        delta.height = 0;
        break;
    }

    onResize(delta);
  }, [transform, onResize, direction]);

  return <span className="Handle" data-direction={direction} ref={ref} />;
}

function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
