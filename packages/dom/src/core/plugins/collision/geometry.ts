import {
  CorePlugin,
  type Renderer,
  type UniqueIdentifier,
} from '@dnd-kit/abstract';
import {batch, untracked} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager/index.ts';

/** One coherent measurement pass for changes that can move multiple targets. */
export function refreshCollisionGeometry(manager: DragDropManager) {
  untracked(() => {
    const {source, controller, status} = manager.dragOperation;
    if (!status.dragging || !source || controller?.signal.aborted) return;

    batch(() => {
      for (const entry of manager.registry.droppables) {
        if (
          !entry.disabled &&
          entry.accepts(source) &&
          entry.element?.isConnected
        ) {
          entry.refreshShape();
        }
      }
    });
  });
}

// Keep assignment/restoration of the existing renderer property composable.
// These adapters and their ownership stay entirely inside the DOM package.
const renderers = new WeakMap<Renderer, Renderer>();
export function unwrapRenderer(renderer: Renderer): Renderer {
  return renderers.get(renderer) ?? renderer;
}

/** DOM rendering includes measurement before an action reports completion. */
export class CollisionGeometry extends CorePlugin<
  DragDropManager<any, any, any>
> {
  #renderers = new WeakMap<Renderer, Renderer>();
  #destroyed = false;
  #pending?: {
    controller: AbortController;
    source: UniqueIdentifier;
    work: Promise<void>;
  };

  wrapRenderer(renderer: Renderer): Renderer {
    renderer = unwrapRenderer(renderer);
    if (this.#destroyed) return renderer;
    const existing = this.#renderers.get(renderer);
    if (existing) return existing;

    const geometry = this;
    const adapter: Renderer = {
      get rendering() {
        const {controller, source, status} = geometry.manager.dragOperation;
        const rendering = renderer.rendering;
        if (!controller || !source || !status.dragging) return rendering;
        const sourceId = source.id;
        return rendering.then(() => geometry.#measure(controller, sourceId));
      },
    };
    this.#renderers.set(renderer, adapter);
    renderers.set(adapter, renderer);
    return adapter;
  }

  #measure(controller: AbortController, source: UniqueIdentifier) {
    const current = () => {
      const operation = this.manager.dragOperation;
      return (
        !this.#destroyed &&
        !controller.signal.aborted &&
        operation.controller === controller &&
        operation.source?.id === source &&
        operation.status.dragging &&
        !operation.canceled
      );
    };
    if (!current()) return;
    if (
      this.#pending?.controller === controller &&
      this.#pending.source === source
    )
      return this.#pending.work;

    const work = Promise.resolve().then(() => {
      // Share requests ready together, but a later request must see any layout
      // written after this measurement, even within the same microtask turn.
      if (this.#pending?.work === work) this.#pending = undefined;
      if (current()) refreshCollisionGeometry(this.manager);
    });
    this.#pending = {controller, source, work};
    return work;
  }

  public override destroy = () => {
    this.#destroyed = true;
    this.#pending = undefined;
  };
}
