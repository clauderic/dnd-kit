import type {Announcements, ScreenReaderInstructions} from './types.ts';

export const defaultAttributes = {
  role: 'button',
  roleDescription: 'draggable',
  tabIndex: 0,
};

export const defaultDescriptionIdPrefix = `dnd-kit-description`;
export const defaultAnnouncementIdPrefix = `dnd-kit-announcement`;

export const defaultScreenReaderInstructions: ScreenReaderInstructions = {
  draggable: `To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item in a given direction. Press space again to drop the item in its new position, or press escape to cancel.`,
};

export const defaultAnnouncements: Announcements = {
  dragstart({operation: {source}}) {
    if (!source) return;

    return `Picked up draggable item ${source.id}.`;
  },
  dragover({operation: {source, target}}) {
    if (!source) return;

    if (target) {
      return `Draggable item ${source.id} was moved over droppable target ${target.id}.`;
    }

    return `Draggable item ${source.id} is no longer over a droppable target.`;
  },
  dragend({operation: {source, target}, canceled}) {
    if (!source) return;

    if (canceled) {
      return `Dragging was cancelled. Draggable item ${source.id} was dropped.`;
    }

    if (target) {
      return `Draggable item ${source.id} was dropped over droppable target ${target.id}`;
    }

    return `Draggable item ${source.id} was dropped.`;
  },
};
