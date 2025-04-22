import {batch, CleanupFunction} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {Draggable, type DragDropManager} from '@dnd-kit/dom';
import {getDocument, Listeners} from '@dnd-kit/dom/utilities';

export const DraggableFileId = '$DRAGGABLE_FILE_GLOBALLY_UNIQUE_ID';

export class DraggableFile extends Plugin<DragDropManager> {
  private listeners = new Listeners();

  private cleanup: Set<CleanupFunction> = new Set();

  constructor(manager: DragDropManager) {
    super(manager);
    console.log('DraggableFile constructor');

    const draggable = new Draggable({id: DraggableFileId}, manager);

    const unbind = this.listeners.bind(document.body, [
      {type: 'dragenter', listener: this.handleDragEnter.bind(this)},
    ]);

    this.destroy = () => {
      this.cleanup.forEach((cleanup) => cleanup());
      this.cleanup.clear();
      unbind();
      draggable.destroy();
    };
  }

  private handleDragEnter(event: DragEvent) {
    const isDraggingFile = (event.dataTransfer?.types ?? []).includes('Files');
    if (this.disabled || event.relatedTarget || !isDraggingFile) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    // console.log('handleDragEnter', event);

    batch(() => {
      this.manager.actions.setDragSource(DraggableFileId);
      this.manager.actions.start({
        coordinates: {x: event.clientX, y: event.clientY},
        event,
      });
    });

    const ownerDocument = getDocument(event.target);

    const unbindListeners = this.listeners.bind(ownerDocument, [
      {type: 'dragover', listener: this.handleDragOver.bind(this)},
      {type: 'dragleave', listener: this.handleDragLeave.bind(this)},
      {type: 'drop', listener: this.handleDrop.bind(this)},
    ]);

    const cleanup = () => {
      setTimeout(unbindListeners);
    };

    this.cleanup.add(cleanup);
  }

  private handleDragLeave(event: DragEvent) {
    if (event.relatedTarget) {
      return;
    }
    // Prevent the default behaviour of the event
    event.preventDefault();
    event.stopPropagation();

    // console.log('handleDragLeave', event);

    // End the drag and drop operation

    this.manager.actions.stop({canceled: true});

    // Remove the pointer move and up event listeners
    this.cleanup.forEach((cleanup) => cleanup());
    this.cleanup.clear();
  }

  private handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    // console.log('handleDragOver', event);

    this.manager.actions.move({to: {x: event.clientX, y: event.clientY}});
  }

  private handleDrop(event: DragEvent) {
    // Prevent the default behaviour of the event
    event.preventDefault();
    event.stopPropagation();

    // End the drag and drop operation

    this.manager.actions.stop();

    // Remove the pointer move and up event listeners
    this.cleanup.forEach((cleanup) => cleanup());
    this.cleanup.clear();
  }
}
