import {useState} from 'react';
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';
import {SnapModifier} from '@dnd-kit/abstract/modifiers';
import {DragDropProvider} from '@dnd-kit/react';

import {Grid} from '../../components/index.ts';
import {Draggable} from '../DraggableExample.tsx';

export function SnapToGridExample() {
  const [gridSize, setGridSize] = useState(30);
  const [position, setPosition] = useState({x: gridSize, y: gridSize});

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setPosition(({x, y}) => ({
          x: x + event.operation.transform.x,
          y: y + event.operation.transform.y,
        }));
      }}
    >
      <Grid size={gridSize}>
        <Draggable
          id="draggable"
          modifiers={[
            SnapModifier.configure({size: gridSize}),
            RestrictToWindow,
          ]}
          style={{translate: `${position.x}px ${position.y}px`}}
        />
      </Grid>
      <label
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          padding: 15,
          background: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        Grid size
        <br />
        <input
          type="range"
          min="10"
          max="60"
          onChange={(e) => {
            const gridSize = parseInt(e.target.value, 10);

            setGridSize(gridSize);
            setPosition({
              x: gridSize,
              y: gridSize,
            });
          }}
        />
      </label>
    </DragDropProvider>
  );
}
