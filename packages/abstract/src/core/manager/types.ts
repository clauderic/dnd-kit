import type {DragDropManager} from './manager.js';

export type InferDraggable<P> = P extends DragDropManager<infer T> ? T : never;

export type InferDroppable<P> = P extends DragDropManager<any, infer T>
  ? T
  : never;
