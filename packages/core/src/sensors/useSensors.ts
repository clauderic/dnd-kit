import {useMemo} from 'react';

import type {SensorDescriptor, SensorOptions} from './types';

export function useSensors<DraggableData, DroppableData>(
  ...sensors: (
    | SensorDescriptor<any, DraggableData, DroppableData>
    | undefined
    | null
  )[]
): SensorDescriptor<SensorOptions, DraggableData, DroppableData>[] {
  return useMemo(
    () =>
      [...sensors].filter(
        (
          sensor
        ): sensor is SensorDescriptor<any, DraggableData, DroppableData> =>
          sensor != null
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
