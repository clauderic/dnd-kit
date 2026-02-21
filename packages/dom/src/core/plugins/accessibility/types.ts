import type {DragDropEventMap} from '@dnd-kit/abstract';
import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable, Droppable} from '../../entities/index.ts';

export type GetAnnouncementForEvent<
  Key extends keyof DragDropEventMap<any, any, any>,
> = (
  event: DragDropEventMap<Draggable, Droppable, DragDropManager>[Key],
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
