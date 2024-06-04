import {useContext, useEffect} from 'react';

import {DndMonitorContext} from './context';
import type {DndMonitorListener} from './types';

export function useDndMonitor<DraggableData, DroppableData>(
  listener: DndMonitorListener<DraggableData, DroppableData>
) {
  const registerListener = useContext(DndMonitorContext);

  useEffect(() => {
    if (!registerListener) {
      throw new Error(
        'useDndMonitor must be used within a children of <DndContext>'
      );
    }

    const unsubscribe = registerListener(listener);

    return unsubscribe;
  }, [listener, registerListener]);
}
