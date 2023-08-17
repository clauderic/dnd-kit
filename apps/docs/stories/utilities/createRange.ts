import type {UniqueIdentifier} from '@dnd-kit/abstract';

export function createRange(count: number): UniqueIdentifier[] {
  return Array.from(Array(count).keys());
}
