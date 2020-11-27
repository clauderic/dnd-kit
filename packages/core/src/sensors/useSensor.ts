import {useMemo} from 'react';

import {Sensor} from './types';

export type SensorDescriptor<T> = {
  sensor: Sensor<T>;
  options: T;
};

export function useSensor<T>(
  sensor: Sensor<T>,
  options: T
): SensorDescriptor<T> {
  return useMemo(
    () => ({
      sensor,
      options,
    }),
    [sensor, options]
  );
}
