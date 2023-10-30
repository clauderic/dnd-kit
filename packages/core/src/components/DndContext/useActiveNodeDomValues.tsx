import type {DeepRequired} from '@dnd-kit/utilities';
import {useMemo} from 'react';
import {useCachedNode, useInitialRect, useRect} from '../../hooks/utilities';
import type {DraggableNodes} from '../../store';
import type {UniqueIdentifier} from '../../types';
import type {MeasuringConfiguration} from './types';

export function useActiveNodeDomValues(
  draggableNodes: DraggableNodes,
  measuringConfiguration: DeepRequired<MeasuringConfiguration>,
  activeId: UniqueIdentifier | null
) {
  const activeNode = useCachedNode(draggableNodes, activeId);

  const initialActiveNodeRect = useInitialRect(
    activeNode,
    measuringConfiguration.draggable.measure
  );

  const activeNodeRect = useRect(
    activeNode,
    measuringConfiguration.draggable.measure,
    initialActiveNodeRect
  );

  const value = useMemo(() => {
    return activeNode
      ? {
          activeNode,
          activeNodeRect,
          initialActiveNodeRect,
        }
      : null;
  }, [activeNode, activeNodeRect, initialActiveNodeRect]);

  return value;
}
