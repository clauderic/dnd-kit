import type {Announcements, ScreenReaderInstructions} from './types';

export const defaultScreenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export const defaultAnnouncements: Announcements = {
  onDragStart({active}) {
    return `Picked up draggable item ${active.id}.`;
  },
  onDragOver({active, over}) {
    if (over) {
      return `Draggable item ${active.id} was moved over droppable area ${over.id}.`;
    }

    return `Draggable item ${active.id} is no longer over a droppable area.`;
  },
  onDragEnd({active, over}) {
    if (over) {
      return `Draggable item ${active.id} was dropped over droppable area ${over.id}`;
    }

    return `Draggable item ${active.id} was dropped.`;
  },
  onDragCancel({active}) {
    return `Dragging was cancelled. Draggable item ${active.id} was dropped.`;
  },
};
