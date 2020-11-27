import {useMemo} from 'react';
import {
  MouseSensor,
  MouseSensorOptions,
  TouchSensor,
  TouchSensorOptions,
  KeyboardSensor,
  KeyboardSensorOptions,
  useSensor,
  SensorDescriptor,
  SensorOptions,
  PointerSensorOptions,
} from '@dropshift/core';

import {getNextKeyboardCoordinates} from '../sensors';
import {SortingStrategy} from '../types';

interface Arguments {
  strategy: SortingStrategy;
  mouse?: {
    options?: MouseSensorOptions;
    disabled?: boolean;
  };
  keyboard?: {
    options?: KeyboardSensorOptions;
    disabled?: boolean;
  };
  touch?: {
    options?: TouchSensorOptions;
    disabled?: boolean;
  };
}

function useCombineSensors(
  ...sensors: SensorDescriptor<SensorOptions>[]
): SensorDescriptor<SensorOptions>[] {
  return useMemo(
    () => [...sensors],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...sensors]
  );
}

export function useSortableSensors({
  strategy,
  mouse,
  touch,
  keyboard,
}: Arguments): SensorDescriptor<PointerSensorOptions>[] {
  const mouseSensor = useSensor(MouseSensor, {...mouse?.options});
  const touchSensor = useSensor(TouchSensor, {...touch?.options});
  const getNextCoordinates = useMemo(
    () => getNextKeyboardCoordinates(strategy),
    [strategy]
  );
  const keyboardSensor = useSensor(KeyboardSensor, {
    getNextCoordinates,
    ...keyboard?.options,
  });

  return useCombineSensors(mouseSensor, touchSensor, keyboardSensor);
}
