import {useRef, useState} from 'react';
import type {Coordinates} from '@dnd-kit/geometry';
import {
  DragDropProvider,
  DragOverlay,
  useDraggable,
  useDragDropMonitor,
} from '@dnd-kit/react';

import {Button} from '../../components/index.ts';
import styles from './styles.module.css';

export function AdjustedTransformExample() {
  const [transform, setTransform] = useState<Coordinates>({x: 0, y: 0});
  const [scrollAdjustment, setScrollAdjustment] = useState<Coordinates>({
    x: 0,
    y: 0,
  });
  const [adjustedTransform, setAdjustedTransform] = useState<Coordinates>({
    x: 0,
    y: 0,
  });

  return (
    <DragDropProvider
      onDragMove={(event) => {
        const {transform, scrollAdjustment, adjustedTransform} =
          event.operation;
        setTransform(transform);
        setScrollAdjustment(scrollAdjustment);
        setAdjustedTransform(adjustedTransform);
      }}
      onDragEnd={() => {
        setTransform({x: 0, y: 0});
        setScrollAdjustment({x: 0, y: 0});
        setAdjustedTransform({x: 0, y: 0});
      }}
    >
      <div className={styles.Scrollable}>
        <p className={styles.Hint}>
          This button is translated by <code>adjustedTransform</code>.
        </p>
        <Draggable id="adjusted-transform" />
        <div className={styles.Spacer} />
      </div>

      <Hud
        transform={transform}
        scrollAdjustment={scrollAdjustment}
        adjustedTransform={adjustedTransform}
      />

      <DragOverlay>
        {/** Workaround for the issue: https://github.com/clauderic/dnd-kit/issues/2055 */}
        <div />
      </DragOverlay>
    </DragDropProvider>
  );
}

export function NestedScrollablesExample() {
  const [transform, setTransform] = useState<Coordinates>({x: 0, y: 0});
  const [scrollAdjustment, setScrollAdjustment] = useState<Coordinates>({
    x: 0,
    y: 0,
  });
  const [adjustedTransform, setAdjustedTransform] = useState<Coordinates>({
    x: 0,
    y: 0,
  });

  return (
    <DragDropProvider
      onDragMove={(event) => {
        const {transform, scrollAdjustment, adjustedTransform} =
          event.operation;
        setTransform(transform);
        setScrollAdjustment(scrollAdjustment);
        setAdjustedTransform(adjustedTransform);
      }}
      onDragEnd={() => {
        setTransform({x: 0, y: 0});
        setScrollAdjustment({x: 0, y: 0});
        setAdjustedTransform({x: 0, y: 0});
      }}
    >
      <div className={styles.Page}>
        <p className={styles.Hint}>
          Scroll the window, the outer panel and the inner panel while dragging
          — <code>adjustedTransform</code> accumulates every scroll offset.
        </p>
        <div className={styles.Outer} data-testid="outer-scrollable">
          <div className={styles.OuterSpacer}>
            <div className={styles.Inner} data-testid="inner-scrollable">
              <Draggable id="nested-adjusted-transform" />
              <div className={styles.InnerSpacer} />
            </div>
          </div>
        </div>
      </div>

      <Hud
        transform={transform}
        scrollAdjustment={scrollAdjustment}
        adjustedTransform={adjustedTransform}
      />

      <DragOverlay>
        {/** Workaround for the issue: https://github.com/clauderic/dnd-kit/issues/2055 */}
        <div />
      </DragOverlay>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
}

function Draggable({id}: DraggableProps) {
  const elementRef = useRef<HTMLButtonElement>(null);
  const {isDragging} = useDraggable({id, element: elementRef});

  useDragDropMonitor({
    onDragMove(event) {
      const {adjustedTransform} = event.operation;
      if (elementRef.current) {
        elementRef.current.style.translate = `${adjustedTransform.x}px ${adjustedTransform.y}px`;
      }
    },
    onDragEnd() {
      if (elementRef.current) elementRef.current.style.translate = '';
    },
  });

  return (
    <Button ref={elementRef} shadow={isDragging}>
      draggable
    </Button>
  );
}

interface HudProps {
  transform: Coordinates;
  scrollAdjustment: Coordinates;
  adjustedTransform: Coordinates;
}

function Hud({transform, scrollAdjustment, adjustedTransform}: HudProps) {
  return (
    <div className={styles.Hud}>
      <div className={styles.HudTitle}>Drag operation</div>
      <HudRow label="transform" value={transform} />
      <HudRow label="scrollAdjustment" value={scrollAdjustment} />
      <HudRow label="adjustedTransform" value={adjustedTransform} highlight />
    </div>
  );
}

function HudRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: Coordinates;
  highlight?: boolean;
}) {
  return (
    <div
      className={styles.HudRow}
      data-highlight={highlight ? 'true' : undefined}
    >
      <span className={styles.HudLabel}>{label}</span>
      <span className={styles.HudValue} data-testid={`hud-value-${label}`}>
        {Math.round(value.x)}, {Math.round(value.y)}
      </span>
    </div>
  );
}
