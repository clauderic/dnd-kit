import type {UniqueIdentifier} from '../../types';

export interface Announcements {
  onDragStart(id: UniqueIdentifier): string | undefined;
  onDragMove?(
    id: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ): string | undefined;
  onDragOver(
    id: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ): string | undefined;
  onDragEnd(
    id: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ): string | undefined;
  onDragCancel(id: UniqueIdentifier): string | undefined;
}

export interface ScreenReaderInstructions {
  draggable: string;
}
