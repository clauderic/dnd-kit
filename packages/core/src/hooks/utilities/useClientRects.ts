import {useCallback, useState, useRef} from 'react';

import {getElementCoordinates} from '../../utilities';
import {DroppableContainers, PositionalClientRectMap} from '../../store/types';
import {useIsomorphicEffect} from '@dnd-kit/utilities';

function getClientRects(
  containers: DroppableContainers | null
): PositionalClientRectMap {
  const clientRects: PositionalClientRectMap = new Map();

  if (containers) {
    for (let {id, clientRect, disabled} of Object.values(containers)) {
      if (disabled) {
        continue;
      }

      if (clientRect.current == null) {
        continue;
      }

      clientRects.set(id, clientRect.current);
    }
  }

  return clientRects;
}

export function useClientRects(
  containers: DroppableContainers | null,
  disabled: boolean
) {
  const [willRecomputeClientRects, setWillRecomputeClientRects] = useState(
    false
  );
  const [clientRects, setClientRects] = useState<PositionalClientRectMap>(() =>
    getClientRects(disabled ? null : containers)
  );
  const containersRef = useRef(containers);

  const recomputeClientRects = useCallback(() => {
    setWillRecomputeClientRects(true);
  }, []);

  useIsomorphicEffect(() => {
    if (containersRef.current !== containers) {
      containersRef.current = containers;
    }

    if (disabled) {
      return;
    }

    if (containers) {
      setWillRecomputeClientRects(true);
    }
  }, [disabled, containers]);

  useIsomorphicEffect(() => {
    const containers = containersRef.current;

    if (willRecomputeClientRects) {
      if (containers) {
        for (let container of Object.values(containers)) {
          container.clientRect.current = container.node.current
            ? getElementCoordinates(container.node.current)
            : null;
        }

        const clientRects = getClientRects(containers);

        setClientRects(clientRects);
        setWillRecomputeClientRects(false);
      }
    }
  }, [willRecomputeClientRects]);

  return {clientRects, recomputeClientRects, willRecomputeClientRects};
}
