import {useMemo} from 'react';

import type {SensorDescriptor, SensorOptions} from './types';

export function useSensors(
  ...sensors: (SensorDescriptor<any> | undefined | null)[]
): SensorDescriptor<SensorOptions>[] {
  return useMemo(
    () =>
      [...sensors].filter(
        (sensor): sensor is SensorDescriptor<any> => sensor != null
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
