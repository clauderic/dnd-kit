import {useCallback, useMemo, useState, useRef, useEffect} from 'react';

import {getElementCoordinates} from '../../utilities';
import {DroppableContainers, PositionalClientRectMap} from '../../store/types';

function getClientRects(
  containers: DroppableContainers | null
): PositionalClientRectMap {
  const clientRects: PositionalClientRectMap = new Map();

  if (containers) {
    for (let {id, clientRect} of Object.values(containers)) {
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
  const clientRects = useMemo(
    () => getClientRects(containers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [containers, willRecomputeClientRects]
  );
  const containersRef = useRef(containers);

  const recomputeClientRects = useCallback(() => {
    setWillRecomputeClientRects(true);
  }, []);

  useEffect(() => {
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

  useEffect(() => {
    if (willRecomputeClientRects) {
      if (containers) {
        for (let container of Object.values(containers)) {
          container.clientRect.current = container.node.current
            ? getElementCoordinates(container.node.current)
            : null;
        }
      }

      setWillRecomputeClientRects(false);
    }
  }, [containers, willRecomputeClientRects]);

  return {clientRects, recomputeClientRects, willRecomputeClientRects};
}
