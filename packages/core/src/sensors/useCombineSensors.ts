import {useMemo} from 'react';
import {SensorDescriptor, SensorOptions} from './types';

export function useSensors(
  ...sensors: SensorDescriptor<any>[]
): SensorDescriptor<SensorOptions>[] {
  return useMemo(
    () => [...sensors],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}
