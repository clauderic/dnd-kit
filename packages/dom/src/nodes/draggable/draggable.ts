import {
  Draggable as AbstractDraggable,
  DraggableInput,
} from '@dnd-kit/abstract';
import type {Data} from '@dnd-kit/abstract';
import {Position} from '@dnd-kit/geometry';
import {
  getScrollableAncestors,
  getScrollOffsets,
  getOwnerDocument,
  Listeners,
  Styles,
} from '@dnd-kit/dom-utilities';
import {computed, effect, reactive, proxy, derived} from '@dnd-kit/state';

import type {DragDropManager} from '../../manager';
import {DOMRectangle} from '../../shapes';

export interface Input<T extends Data = Data> extends DraggableInput<T> {}

class ScrollTracker {
  private listeners: Listeners;
  public scrollOffsets: Position;

  constructor(element: Element) {
    const ownerDocument = getOwnerDocument(element);
    const scrollableAncestors = getScrollableAncestors(element);

    const handleScroll = (event: Event) => {
      if (!event.target) {
        return;
      }

      if (
        event.target === ownerDocument ||
        scrollableAncestors?.includes(event.target as Element)
      ) {
        const scrollOffsets = getScrollOffsets(scrollableAncestors);
        this.scrollOffsets.update(scrollOffsets);
      }
    };

    const initialScrollOffsets = getScrollOffsets(scrollableAncestors);

    this.scrollOffsets = new Position(initialScrollOffsets);
    this.listeners = new Listeners(ownerDocument);
    this.listeners.add('scroll', handleScroll, {
      passive: true,
      capture: true,
    });
  }

  public destroy() {
    this.listeners.clear();
  }
}

export class Draggable<T extends Data = Data> extends AbstractDraggable<T> {
  @reactive
  public activator: Element | undefined;

  @reactive
  public element: Element | undefined;

  @derived
  public get isActive(): boolean {
    const {active} = this.manager.dragOperation;

    return active?.includes(this) ?? false;
  }

  constructor(input: Input<T>, private manager: DragDropManager) {
    super(input);

    const scrollTracker = proxy<ScrollTracker | null>(null);
    const styles = computed(() => {
      const {element} = this;
      return element ? new Styles(element) : null;
    });
    const scrollDelta = computed(() => {
      const delta = scrollTracker.value?.scrollOffsets.delta;

      return (
        delta ?? {
          x: 0,
          y: 0,
        }
      );
    });
    const computedScale = computed(() => {
      return this.shape?.scale ?? {x: 1, y: 1};
    });
    const computedTransform = computed(() => {
      if (!this.isActive) {
        return null;
      }

      const {dragOperation} = manager;
      const {delta} = dragOperation.position;
      const {x: scaleX, y: scaleY} = computedScale.peek();

      return {
        x: delta.x / scaleX + scrollDelta.value.x,
        y: delta.y / scaleY + scrollDelta.value.y,
        scaleX: 1,
        scaleY: 1,
      };
    });

    effect(() => {
      const {element} = this;
      const elementStyles = styles.peek();

      if (!element || !this.isActive) {
        scrollTracker.peek()?.destroy();
        scrollTracker.value = null;
        elementStyles?.reset();

        return;
      }

      elementStyles?.set({
        pointerEvents: 'none',
      });
      scrollTracker.value = new ScrollTracker(element);
    });

    effect(() => {
      const {element} = this;

      if (!element) {
        return;
      }

      const transform = computedTransform.value;
      const elementStyles = styles.peek();

      elementStyles?.set({
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      });

      this.shape = transform ? new DOMRectangle(element) : null;
    });
  }
}
