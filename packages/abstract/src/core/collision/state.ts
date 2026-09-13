import type {Coordinates} from '@dnd-kit/geometry';
import type {UniqueIdentifier} from '../entities/index.ts';
import type {DragDropManager} from '../manager/index.ts';

/** Internal coordination; deliberately absent from the package exports. */
export class CollisionState {
  generation = 0;
  input = 0;
  dirty = false;
  position: Coordinates | undefined;
  transform: Coordinates | undefined;
  serial = 0;
  applied?: {
    input: number;
    source: UniqueIdentifier | null;
    target: UniqueIdentifier | null;
    acknowledgment?: UniqueIdentifier;
  };
  flush?: () => void;

  reset() {
    this.generation++;
    this.applied = undefined;
    this.position = undefined;
    this.transform = undefined;
  }
}

const states = new WeakMap<DragDropManager<any, any>, CollisionState>();

export function collisionState(manager: DragDropManager<any, any>) {
  let state = states.get(manager);
  if (!state) {
    state = new CollisionState();
    states.set(manager, state);
  }
  return state;
}
