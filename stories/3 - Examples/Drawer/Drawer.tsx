import React from 'react';
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
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  );

  return (
    <DndContext
      autoScroll={false}
      modifiers={modifiers}
      sensors={sensors}
      onDragOver={({over}) => {
        console.log(over?.id);
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
    if (over) {
      const expanded = over.id === Region.Expand;
      onChange(expanded);
    }
  }
}
