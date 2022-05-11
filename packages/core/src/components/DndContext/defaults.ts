import type {DeepRequired} from '@dnd-kit/utilities';

import type {DataRef} from '../../store/types';
import {KeyboardSensor, PointerSensor} from '../../sensors';
import {MeasuringStrategy, MeasuringFrequency} from '../../hooks/utilities';
import {
  getClientRect,
  getTransformAgnosticClientRect,
} from '../../utilities/rect';

import type {MeasuringConfiguration} from './types';

export const defaultSensors = [
  {sensor: PointerSensor, options: {}},
  {sensor: KeyboardSensor, options: {}},
];

export const defaultData: DataRef = {current: {}};

export const defaultMeasuringConfiguration: DeepRequired<MeasuringConfiguration> = {
  draggable: {
    measure: getTransformAgnosticClientRect,
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized,
  },
  dragOverlay: {
    measure: getClientRect,
  },
};
