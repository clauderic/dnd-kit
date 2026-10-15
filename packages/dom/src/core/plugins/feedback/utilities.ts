import {batch, untracked} from '@dnd-kit/state';
import {
  cloneElement,
  getFrameElement,
  showPopover,
  ProxiedElements,
  isElement,
} from '@dnd-kit/dom/utilities';

import type {Draggable, Droppable} from '../../entities/index.ts';
import {PLACEHOLDER_ATTRIBUTE} from './constants.ts';

/**
 * Creates a placeholder element for a draggable source
 * The placeholder maintains the original element's dimensions and position
 */
export function createPlaceholder(source: Draggable, type = 'hidden') {
  return untracked(() => {
    const {element, manager} = source;

    if (!element || !manager) return;

    const placeholder = cloneElement(element);
    const {remove} = placeholder;
    let cleanup: Array<() => void> = [];
    const release = () => cleanup.splice(0).forEach((fn) => fn());
    const proxy = () => {
      cleanup = proxyDroppableElements(
        element,
        placeholder,
        manager.registry.droppables
      );
    };

    proxy();
    configurePlaceholder(placeholder, type);

    // The source may have only a descendant target, but sorting still moves and
    // animates its whole placeholder rather than its floating feedback element.
    ProxiedElements.set(element, placeholder);

    placeholder.remove = () => {
      batch(() => {
        release();
        if (ProxiedElements.get(element) === placeholder)
          ProxiedElements.delete(element);
        remove.call(placeholder);
      });
    };

    return {
      element: placeholder,
      updateChildren() {
        untracked(() =>
          batch(() => {
            // Restore original targets before finding their replacement clones.
            // Publishing the replacement tree and proxies together prevents a
            // measurement against detached descendants of the previous clone.
            release();
            placeholder.replaceChildren(...cloneElement(element).childNodes);
            proxy();
            ProxiedElements.set(element, placeholder);
          })
        );
      },
    };
  });
}

/** Match original targets to the corresponding elements in the cloned tree. */
function proxyDroppableElements(
  element: Element,
  placeholder: Element,
  droppables: Iterable<Droppable>
): Array<() => void> {
  const originals = [element, ...element.querySelectorAll('*')];
  const clones = [placeholder, ...placeholder.querySelectorAll('*')];
  const counterparts = new Map(
    originals.map((original, index) => [original, clones[index]])
  );
  const cleanup: Array<() => void> = [];

  for (const droppable of droppables) {
    const original = droppable.element;
    const clone = original && counterparts.get(original);
    if (!original || !clone) continue;

    droppable.proxy = clone;
    ProxiedElements.set(original, clone);
    cleanup.push(() => {
      if (ProxiedElements.get(original) === clone)
        ProxiedElements.delete(original);
      if (droppable.proxy === clone) droppable.proxy = undefined;
    });
  }

  return cleanup;
}

/**
 * Configures accessibility and visual attributes for the placeholder
 */
function configurePlaceholder(placeholder: Element, type = 'hidden'): void {
  placeholder.setAttribute('inert', 'true');
  placeholder.setAttribute('tab-index', '-1');
  placeholder.setAttribute('aria-hidden', 'true');
  placeholder.setAttribute(PLACEHOLDER_ATTRIBUTE, type);
}

/**
 * Checks if two elements are in the same frame context
 */
export function isSameFrame(element: Element, target: Element): boolean {
  if (element === target) return true;
  return getFrameElement(element) === getFrameElement(target);
}

/**
 * Prevent an element with the `popover` attribute from being closed
 */
export function preventPopoverClose(event: Event) {
  const {target} = event;

  if (
    'newState' in event &&
    event.newState === 'closed' &&
    isElement(target) &&
    target.hasAttribute('popover')
  ) {
    requestAnimationFrame(() => showPopover(target));
  }
}

export function isTableRow(element: Element): element is HTMLTableRowElement {
  return element.tagName === 'TR';
}
