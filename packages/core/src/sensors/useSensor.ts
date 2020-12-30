import {useMemo} from 'react';

import {Sensor, SensorDescriptor, SensorOptions} from './types';

export function useSensor<T extends SensorOptions>(
  sensor: Sensor<T>,
  options?: T
): SensorDescriptor<T> {
  return useMemo(
    () => ({
      sensor,
      options: options ?? ({} as T),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sensor, options]
  );
}
