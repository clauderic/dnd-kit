import type {UniqueIdentifier} from '../types';
import type {Data, DroppableContainer} from './types';

type Identifier = UniqueIdentifier | null | undefined;

export class DroppableContainersMap<DataT extends Data = Data> extends Map<
  UniqueIdentifier,
  DroppableContainer<DataT>
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
