import {untracked} from '@dnd-kit/state';
import {
  cloneElement,
  generateUniqueId,
  getFrameElement,
  showPopover,
  ProxiedElements,
  isElement,
} from '@dnd-kit/dom/utilities';

import type {Draggable, Droppable} from '../../entities/index.ts';
import {ATTR_PREFIX, PLACEHOLDER_ATTRIBUTE} from './constants.ts';

/**
 * Creates a placeholder element for a draggable source
 * The placeholder maintains the original element's dimensions and position
 */
export function createPlaceholder(
  source: Draggable,
  type = 'hidden'
): Element | undefined {
  return untracked(() => {
    const {element, manager} = source;

    if (!element || !manager) return;

    const containedDroppables = findContainedDroppables(
      element,
      manager.registry.droppables
    );
    const cleanup: Array<() => void> = [];
    const placeholder = cloneElement(element);
    const {remove} = placeholder;

    proxyDroppableElements(containedDroppables, placeholder, cleanup);
    configurePlaceholder(placeholder, type);

    // Override remove to handle cleanup of proxies
    placeholder.remove = () => {
      cleanup.forEach((fn) => fn());
      remove.call(placeholder);
    };

    return placeholder;
  });
}

/**
 * Maps droppable elements contained within the source element
 * Returns a map of droppables to their temporary identifier attributes
 */
function findContainedDroppables(
  element: Element,
  droppables: Iterable<Droppable>
): Map<Droppable, string> {
  const containedDroppables = new Map<Droppable, string>();

  for (const droppable of droppables) {
    if (!droppable.element) continue;

    if (element === droppable.element || element.contains(droppable.element)) {
      const identifierAttribute = `${ATTR_PREFIX}${generateUniqueId('dom-id')}`;
      droppable.element.setAttribute(identifierAttribute, '');
      containedDroppables.set(droppable, identifierAttribute);
    }
  }

  return containedDroppables;
}

/**
 * Sets up proxy relationships between original droppable elements and their clones
 */
function proxyDroppableElements(
  containedDroppables: Map<Droppable, string>,
  placeholder: Element,
  cleanup: Array<() => void>
): void {
  for (const [droppable, identifierAttribute] of containedDroppables) {
    if (!droppable.element) continue;

    const selector = `[${identifierAttribute}]`;
    const clonedElement = placeholder.matches(selector)
      ? placeholder
      : placeholder.querySelector(selector);

    droppable.element.removeAttribute(identifierAttribute);

    if (!clonedElement) continue;

    const originalElement = droppable.element;

    droppable.proxy = clonedElement;
    clonedElement.removeAttribute(identifierAttribute);

    ProxiedElements.set(originalElement, clonedElement);

    cleanup.push(() => {
      ProxiedElements.delete(originalElement);
      droppable.proxy = undefined;
    });
  }
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
