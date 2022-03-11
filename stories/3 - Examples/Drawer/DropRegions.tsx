import React from 'react';
import {useDroppable} from '@dnd-kit/core';

import {Region} from './constants';
import styles from './Drawer.module.css';

export function DropRegions() {
  const {active, setNodeRef: setExpandRegionNodeRef} = useDroppable({
    id: Region.Expand,
  });
  const {setNodeRef: setCollapseRegionRef} = useDroppable({
    id: Region.Collapse,
  });

  if (!active) {
    return null;
  }

  return (
    <div className={styles.DropRegions}>
      <div ref={setExpandRegionNodeRef} />
      <div ref={setCollapseRegionRef} />
    </div>
  );
}
