import type {Active, AnyData, Over} from '../../store';

export interface Arguments<DraggableData, DroppableData> {
  active: Active<DraggableData>;
  over: Over<DroppableData> | null;
}

export interface Announcements<
  DraggableData = AnyData,
  DroppableData = AnyData
> {
  onDragStart({
    active,
  }: Pick<Arguments<DraggableData, never>, 'active'>): string | undefined;
  onDragMove?({
    active,
    over,
  }: Arguments<DraggableData, DroppableData>): string | undefined;
  onDragOver({
    active,
    over,
  }: Arguments<DraggableData, DroppableData>): string | undefined;
  onDragEnd({
    active,
    over,
  }: Arguments<DraggableData, DroppableData>): string | undefined;
  onDragCancel({
    active,
    over,
  }: Arguments<DraggableData, DroppableData>): string | undefined;
}

export interface ScreenReaderInstructions {
  draggable: string;
}
