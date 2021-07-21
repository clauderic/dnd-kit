import type {UniqueIdentifier} from '../types';
import type {DroppableContainer} from './types';

type Key = UniqueIdentifier | null | undefined;

export class DroppableContainersMap extends Map<
  UniqueIdentifier,
  DroppableContainer
> {
  get(id: Key) {
    return id != null ? super.get(id) ?? undefined : undefined;
  }

  toArray() {
    return Array.from(this.values());
  }

  getEnabled() {
    return this.toArray().filter(({disabled}) => !disabled);
  }

  getNodeFor(id: Key) {
    return this.get(id)?.node.current ?? undefined;
  }
}
