import type {Active, Data, Over} from '../store';
import type {Collision} from '../utilities/algorithms';

import type {Translate} from './coordinates';

interface DragEvent<DataT extends Data = Data> {
  activatorEvent: Event;
  active: Active<DataT>;
  collisions: Collision[] | null;
  delta: Translate;
  over: Over<DataT> | null;
}

export interface DragStartEvent<DataT extends Data = Data>
  extends Pick<DragEvent<DataT>, 'active'> {}

export interface DragMoveEvent<DataT extends Data = Data>
  extends DragEvent<DataT> {}

export interface DragOverEvent<DataT extends Data = Data>
  extends DragMoveEvent<DataT> {}

export interface DragEndEvent<DataT extends Data = Data>
  extends DragEvent<DataT> {}

export interface DragCancelEvent<DataT extends Data = Data>
  extends DragEndEvent<DataT> {}
