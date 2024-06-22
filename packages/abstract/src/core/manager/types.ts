import type {DragDropManager} from './manager.ts';

export type InferDraggable<P> =
  P extends DragDropManager<infer T, any> ? T : never;

export type InferDroppable<P> =
  P extends DragDropManager<any, infer T> ? T : never;
