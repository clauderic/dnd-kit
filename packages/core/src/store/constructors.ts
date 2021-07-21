import type {UniqueIdentifier} from '../types';
import type {DroppableContainer} from './types';

type Identifier = UniqueIdentifier | null | undefined;

export class DroppableContainersMap extends Map<
  UniqueIdentifier,
  DroppableContainer
> {
  get(id: Identifier) {
    return id != null ? super.get(id) ?? undefined : undefined;
  }

  toArray(): DroppableContainer[] {
    return Array.from(this.values());
  }

  getEnabled(): DroppableContainer[] {
    return this.toArray().filter(({disabled}) => !disabled);
  }

  getNodeFor(id: Identifier) {
    return this.get(id)?.node.current ?? undefined;
  }
}
