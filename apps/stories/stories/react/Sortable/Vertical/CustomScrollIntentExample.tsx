import {useState, memo} from 'react';
import type {PropsWithChildren} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {AutoScroller} from '@dnd-kit/dom';
import {
  ScrollDirection,
  suppressOpposingIntent,
  applyAcceleration,
  applyAxisInversion,
  stopAtBoundaries,
  type ScrollActivation,
  type ScrollIntentDetector,
} from '@dnd-kit/dom/utilities';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {directionBiased} from '@dnd-kit/collision';

import {Item} from '../../components/index.ts';
import {createRange} from '@dnd-kit/stories-shared/utilities';

const UPWARD_ZONE_RATIO = 0.8;

const detectSplitScrollIntent: ScrollIntentDetector = (ctx, options) => {
  const {pointer, scrollPosition, inverted, requestedDirection} = ctx;
  const {rect} = scrollPosition;

  const activation: ScrollActivation = {
    direction: {x: ScrollDirection.Idle, y: ScrollDirection.Idle},
    intensity: {x: 0, y: 0},
  };

  const within =
    rect.height > 0 && pointer.y >= rect.top && pointer.y <= rect.bottom;

  if (within) {
    const splitY = rect.top + rect.height * UPWARD_ZONE_RATIO;

    if (pointer.y < splitY) {
      activation.direction.y = ScrollDirection.Reverse;
      activation.intensity.y =
        (splitY - pointer.y) / (rect.height * UPWARD_ZONE_RATIO);
    } else {
      activation.direction.y = ScrollDirection.Forward;
      activation.intensity.y =
        (pointer.y - splitY) / (rect.height * (1 - UPWARD_ZONE_RATIO));
    }
  }

  const suppressed = suppressOpposingIntent(activation, requestedDirection);
  const accelerated = applyAcceleration(suppressed, options?.acceleration);
  const flipped = applyAxisInversion(accelerated, inverted);

  return stopAtBoundaries(flipped, scrollPosition);
};

interface Props {
  itemCount?: number;
}

export function CustomScrollIntentExample({itemCount = 100}: Props) {
  const [items, setItems] = useState(createRange(itemCount));

  return (
    <DragDropProvider
      plugins={(defaults) => [
        ...defaults,
        AutoScroller.configure({detectScrollIntent: detectSplitScrollIntent}),
      ]}
      onDragEnd={(event) => {
        setItems((items) => move(items, event));
      }}
    >
      <ActivationOverlay />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
          padding: '0 30px',
        }}
      >
        {items.map((id, index) => (
          <SortableItem key={id} id={id} index={index} />
        ))}
      </div>
    </DragDropProvider>
  );
}

function ActivationOverlay() {
  const upwardPercent = UPWARD_ZONE_RATIO * 100;
  const downwardPercent = 100 - upwardPercent;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <Zone
        ratio={UPWARD_ZONE_RATIO}
        label={`↑ Scroll up · ${upwardPercent}%`}
        background="rgba(59, 130, 246, 0.06)"
        accent="rgb(37, 99, 235)"
        align="flex-start"
        divider
      />
      <Zone
        ratio={1 - UPWARD_ZONE_RATIO}
        label={`↓ Scroll down · ${downwardPercent}%`}
        background="rgba(239, 68, 68, 0.06)"
        accent="rgb(220, 38, 38)"
        align="flex-end"
      />
    </div>
  );
}

interface ZoneProps {
  ratio: number;
  label: string;
  background: string;
  accent: string;
  align: 'flex-start' | 'flex-end';
  divider?: boolean;
}

function Zone({ratio, label, background, accent, align, divider}: ZoneProps) {
  return (
    <div
      style={{
        height: `${ratio * 100}%`,
        background,
        borderBottom: divider ? `1px dashed ${accent}` : undefined,
        display: 'flex',
        alignItems: align,
        justifyContent: 'center',
        padding: 12,
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: accent,
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '2px 8px',
          borderRadius: 4,
        }}
      >
        {label}
      </span>
    </div>
  );
}

const SortableItem = memo(function SortableItem({
  id,
  index,
}: PropsWithChildren<{id: UniqueIdentifier; index: number}>) {
  const [element, setElement] = useState<Element | null>(null);
  const {isDragging} = useSortable({
    id,
    index,
    element,
    collisionDetector: directionBiased,
  });

  return (
    <Item ref={setElement} shadow={isDragging}>
      {id}
    </Item>
  );
});
