import type {MutableRefObject} from 'react';
import type {DraggableNodes, Over} from '../../store';
import type {
  Coordinates,
  DragStartEvent,
  UniqueIdentifier,
  ClientRect,
  Translate,
  DragEndEvent,
} from '../../types';
import type {Collision} from '../../utilities';
import {defaultData} from '../DndContext/defaults';

enum Status {
  Uninitialized,
  Initializing,
  Initialized,
}

export class Api {
  state = {};
  draggableNodes: DraggableNodes = new Map();
  status: Status = Status.Uninitialized;
  active: UniqueIdentifier | null = null;
  initialCoordinates: Coordinates = {x: 0, y: 0};

  startDrag(
    id: UniqueIdentifier | null,
    activeRects: MutableRefObject<{
      initial: ClientRect | null;
      translated: ClientRect | null;
    }>,
    initialCoordinates: Coordinates,
    onDragStart?: (event: DragStartEvent) => void
  ) {
    if (id == null) {
      return;
    }
    const draggableNode = this.draggableNodes.get(id);

    if (!draggableNode) {
      return;
    }
    const event: DragStartEvent = {
      active: {id, data: draggableNode.data, rect: activeRects},
    };

    onDragStart?.(event);
    this.status = Status.Initializing;
    this.active = id;
    this.initialCoordinates = initialCoordinates;
  }

  endDrag(
    activeRects: MutableRefObject<{
      initial: ClientRect | null;
      translated: ClientRect | null;
    }>,
    type: 'onDragEnd' | 'onDragCancel',
    sensorState: {
      over: Over | null;
      collisions: Collision[] | null;
      activatorEvent: Event | null;
      delta: Translate | null;
    },
    onDragEnd?: (event: DragEndEvent) => void
  ) {
    const event = this.active
      ? {
          ...sensorState,
          active: {
            id: this.active,
            data: this.draggableNodes.get(this.active)?.data ?? defaultData,
            rect: activeRects,
          },
        }
      : null;
    const shouldFireEvent = this.active && sensorState.delta;

    this.active = null;
    this.initialCoordinates = {x: 0, y: 0};
    this.status = Status.Uninitialized;

    if (shouldFireEvent) {
      onDragEnd?.(event as DragEndEvent);
    }
  }
}
