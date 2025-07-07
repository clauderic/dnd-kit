import { createSignal, JSX, Setter } from 'solid-js';
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import { SnapModifier } from '@dnd-kit/abstract/modifiers';
import { DragDropProvider } from '@dnd-kit/solid';

import { Draggable } from './DraggableExample.tsx';

interface GridProps {
  children: JSX.Element;
  size: number;
}

function Grid(props: GridProps) {
  return (
    <div
      class="fixed inset-0"
      style={{
        'background-image': `repeating-linear-gradient(0deg,transparent,transparent calc(${props.size}px - 1px),#ddd calc(${props.size}px - 1px),#ddd ${props.size}px),repeating-linear-gradient(-90deg,transparent,transparent calc(${props.size}px - 1px),#ddd calc(${props.size}px - 1px),#ddd ${props.size}px)`,
        'background-size': `${props.size}px ${props.size}px`,
      }}
    >
      {props.children}
    </div>
  );
}

export function SnapToGridExample() {
  const [gridSize, setGridSize] = createSignal(30);
  const [position, setPosition] = createSignal({ x: gridSize(), y: gridSize() });

  const handleDragEnd = (event: any) => {
    setPosition(({ x, y }) => ({
      x: x + event.operation.transform.x,
      y: y + event.operation.transform.y,
    }));
  };

  const handleRangeChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const size = parseInt(target.value, 10);
    setGridSize(size);
    setPosition({ x: size, y: size });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <Grid size={gridSize()}>
        <Draggable
          id="draggable"
          modifiers={[
            SnapModifier.configure({ size: gridSize() }),
            RestrictToWindow,
          ]}
          style={{ translate: `${position().x}px ${position().y}px` }}
        />
      </Grid>
      <label
        style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          padding: '15px',
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        Grid size
        <br />
        <input
          type="range"
          min="10"
          max="60"
          value={gridSize()}
          onInput={handleRangeChange}
        />
      </label>
    </DragDropProvider>
  );
}
