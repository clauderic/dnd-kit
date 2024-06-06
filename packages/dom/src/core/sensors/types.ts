import type {Sensors as AbstractSensors} from '@dnd-kit/abstract';

import type {DragDropManager} from '../manager/index.ts';

export type Sensors = AbstractSensors<DragDropManager>;
