import {useMemo} from 'react';

import type {Sensor, SensorDescriptor, SensorOptions} from './types';

export function useSensor<
  T extends SensorOptions,
  DraggableData,
  DroppableData
>(
  sensor: Sensor<T, DraggableData, DroppableData>,
  options?: T
): SensorDescriptor<T, DraggableData, DroppableData> {
  return useMemo(
    () => ({
      sensor,
      options: options ?? ({} as T),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
