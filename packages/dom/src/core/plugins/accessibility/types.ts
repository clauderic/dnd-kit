import type {DragDropEvents} from '@dnd-kit/abstract';
import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable, Droppable} from '../../entities/index.ts';

export type GetAnnouncementForEvent<
  Key extends keyof DragDropEvents<any, any, any>,
> = (
  event: Parameters<
    DragDropEvents<Draggable, Droppable, DragDropManager>[Key]
  >[0],
  manager: DragDropManager
) => string | undefined;

export interface Announcements {
  dragstart: GetAnnouncementForEvent<'dragstart'>;
  dragmove?: GetAnnouncementForEvent<'dragmove'>;
  dragover?: GetAnnouncementForEvent<'dragover'>;
  dragend: GetAnnouncementForEvent<'dragend'>;
}

export interface ScreenReaderInstructions {
  draggable: string;
}
