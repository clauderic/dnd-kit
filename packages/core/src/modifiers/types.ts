import type {Transform} from '@dnd-kit/utilities';
import type {Active, AnyData, Over} from '../store';
import type {ClientRect} from '../types';

export type Modifier<
  DraggableData = AnyData,
  DroppableData = AnyData
> = (args: {
  activatorEvent: Event | null;
  active: Active<DraggableData> | null;
  activeNodeRect: ClientRect | null;
  draggingNodeRect: ClientRect | null;
  containerNodeRect: ClientRect | null;
  over: Over<DroppableData> | null;
  overlayNodeRect: ClientRect | null;
  scrollableAncestors: Element[];
  scrollableAncestorRects: ClientRect[];
  transform: Transform;
  windowRect: ClientRect | null;
}) => Transform;

export type Modifiers<
  DraggableData = AnyData,
  DroppableData = AnyData
> = Modifier<DraggableData, DroppableData>[];
