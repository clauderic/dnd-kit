import {UniqueIdentifier} from '../../types';

export const screenReaderInstructions = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item around.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export type ScreenReaderInstructions = typeof screenReaderInstructions;

export const announcements: Announcements = {
  onDragStart(id: UniqueIdentifier) {
    return `Picked up draggable item ${id}.`;
  },
  onDragOver(id: UniqueIdentifier, overId: UniqueIdentifier | undefined) {
    if (overId) {
      return `Draggable item ${id} was moved over droppable area ${overId}.`;
    }

    return `Draggable item ${id} is no longer over a droppable area.`;
  },
  onDragEnd(id: UniqueIdentifier, overId: UniqueIdentifier | undefined) {
    if (overId) {
      return `Draggable item was dropped over droppable area ${overId}`;
    }

    return `Draggable item ${id} was dropped.`;
  },
  onDragCancel(id: UniqueIdentifier) {
    return `Dragging was cancelled. Draggable item ${id} was dropped.`;
  },
};

export type Announcements = {
  onDragStart(id: UniqueIdentifier): string | undefined;
  onDragOver(
    id: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ): string | undefined;
  onDragEnd(
    id: UniqueIdentifier,
    overId: UniqueIdentifier | undefined
  ): string | undefined;
  onDragCancel(id: UniqueIdentifier): string | undefined;
};
