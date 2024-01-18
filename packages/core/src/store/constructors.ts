import type {UniqueIdentifier} from '../types';
import type {DroppableContainer} from './types';

type Identifier = UniqueIdentifier | null | undefined;

export class DroppableContainersMap<DroppableData> extends Map<
  UniqueIdentifier,
  DroppableContainer<DroppableData>
> {
  get(id: Identifier) {
    return id != null ? super.get(id) ?? undefined : undefined;
  }

  toArray(): DroppableContainer<DroppableData>[] {
    return Array.from(this.values());
  }

  getEnabled(): DroppableContainer<DroppableData>[] {
    return this.toArray().filter(({disabled}) => !disabled);
  }

  getNodeFor(id: Identifier) {
    return this.get(id)?.node.current ?? undefined;
  }
}
