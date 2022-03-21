import React, {useRef} from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';

import {Region} from './constants';
import {rubberbandModifier} from './modifiers';
import {DropRegions} from './DropRegions';
import {Sheet} from './Sheet';
import styles from './Drawer.module.css';

export interface Props {
  accessibilityLabel?: string;
  children: React.ReactNode;
  header: React.ReactNode;
  label?: string;
  expanded: boolean;
  onChange: (expanded: boolean) => void;
}

const modifiers = [restrictToVerticalAxis, rubberbandModifier];

export function Drawer({children, expanded, header, onChange}: Props) {
  const tracked = useRef({
    distance: 0,
    timestamp: 0,
    velocity: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 25,
        tolerance: 40,
      },
    })
  );

  return (
    <DndContext
      autoScroll={false}
      modifiers={modifiers}
      sensors={sensors}
      onDragMove={({delta}) => {
        // Track drag velocity
        const timestamp = Date.now();
        const timeDelta = timestamp - tracked.current.timestamp;
        const distance = tracked.current.distance - delta.y;
        const velocity = Math.round((distance / timeDelta) * 1000);

        tracked.current = {
          distance: delta.y,
          velocity,
          timestamp,
        };
      }}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.Drawer}>
        <Sheet expanded={expanded} header={header}>
          {children}
        </Sheet>
        <DropRegions />
      </div>
    </DndContext>
  );

  function handleDragEnd({over}: DragEndEvent) {
    const {velocity} = tracked.current;

    if (Math.abs(velocity) > 500) {
      // Directional velocity is high, assume intent to expand/collapse
      // even if we are not over that region.
      onChange(velocity > 0);
    } else if (over) {
      const expanded = over.id === Region.Expand;
      onChange(expanded);
    }

    tracked.current = {
      distance: 0,
      timestamp: 0,
      velocity: 0,
    };
  }
}
