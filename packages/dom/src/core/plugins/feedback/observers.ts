import {
  supportsStyle,
  showPopover,
  DOMRectangle,
  getFixedPositionOffset,
  type Styles,
} from '@dnd-kit/dom/utilities';
import {Rectangle, type Coordinates} from '@dnd-kit/geometry';

import {CSS_PREFIX, IGNORED_ATTRIBUTES, IGNORED_STYLES} from './constants.ts';
import {isTableRow} from './utilities.ts';

export function createElementMutationObserver(
  element: Element,
  placeholder: Element,
  clone: boolean
): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    let hasChildrenMutations = false;

    for (const mutation of mutations) {
      if (mutation.target !== element) {
        hasChildrenMutations = true;
        continue;
      }

      if (mutation.type !== 'attributes') {
        continue;
      }

      // Attribute name is guaranteed to be non-null if type is "attributes"
      // https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord/attributeName#value
      const attributeName = mutation.attributeName!;

      if (
        attributeName.startsWith('aria-') ||
        IGNORED_ATTRIBUTES.includes(attributeName)
      ) {
        continue;
      }

      const attributeValue = element.getAttribute(attributeName);

      if (attributeName === 'style') {
        if (supportsStyle(element) && supportsStyle(placeholder)) {
          const styles = element.style;

          for (const key of Array.from(placeholder.style)) {
            if (styles.getPropertyValue(key) === '') {
              placeholder.style.removeProperty(key);
            }
          }

          for (const key of Array.from(styles)) {
            if (
              IGNORED_STYLES.includes(key) ||
              key.startsWith(CSS_PREFIX)
            ) {
              continue;
            }

            const value = styles.getPropertyValue(key);

            placeholder.style.setProperty(key, value);
          }
        }
      } else if (attributeValue !== null) {
        placeholder.setAttribute(attributeName, attributeValue);
      } else {
        placeholder.removeAttribute(attributeName);
      }
    }

    if (hasChildrenMutations && clone) {
      placeholder.innerHTML = element.innerHTML;
    }
  });

  observer.observe(element, {
    attributes: true,
    subtree: true,
    childList: true,
  });

  return observer;
}

export function createDocumentMutationObserver(
  element: Element,
  placeholder: Element,
  feedbackElement: Element
): MutationObserver {
  const observer = new MutationObserver((entries) => {
    for (const entry of entries) {
      if (entry.addedNodes.length === 0) continue;

      for (const node of Array.from(entry.addedNodes)) {
        if (
          node.contains(element) &&
          element.nextElementSibling !== placeholder
        ) {
          element.insertAdjacentElement('afterend', placeholder);
          showPopover(feedbackElement);
          return;
        }

        if (
          node.contains(placeholder) &&
          placeholder.previousElementSibling !== element
        ) {
          placeholder.insertAdjacentElement('beforebegin', element);
          showPopover(feedbackElement);
          return;
        }
      }
    }
  });

  observer.observe(element.ownerDocument.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

export interface ResizeObserverContext {
  placeholder: Element;
  element: Element;
  feedbackElement: Element;
  frameTransform: {x: number; y: number; scaleX: number; scaleY: number};
  transformOrigin: Coordinates;
  width: number;
  height: number;
  top: number;
  left: number;
  widthOffset: number;
  heightOffset: number;
  delta: Coordinates;
  styles: Styles;
  dragOperation: {shape: any};
  getTranslate: () => Coordinates | undefined;
  getElementMutationObserver: () => MutationObserver | undefined;
  getSavedCellWidths: () => string[] | undefined;
  setSavedCellWidths: (widths: string[]) => void;
}

export function createResizeObserver(ctx: ResizeObserverContext): ResizeObserver {
  return new ResizeObserver(() => {
    const placeholderShape = new DOMRectangle(ctx.placeholder, {
      frameTransform: ctx.frameTransform,
      ignoreTransforms: true,
    });
    const origin = ctx.transformOrigin ?? {x: 1, y: 1};
    const dX = (ctx.width - placeholderShape.width) * origin.x + ctx.delta.x;
    const dY = (ctx.height - placeholderShape.height) * origin.y + ctx.delta.y;
    const fixedOffset = getFixedPositionOffset();

    ctx.styles.set(
      {
        width: placeholderShape.width - ctx.widthOffset,
        height: placeholderShape.height - ctx.heightOffset,
        top: ctx.top + dY + fixedOffset.y,
        left: ctx.left + dX + fixedOffset.x,
      },
      CSS_PREFIX
    );
    ctx.getElementMutationObserver()?.takeRecords();

    if (isTableRow(ctx.element) && isTableRow(ctx.placeholder)) {
      const cells = Array.from(ctx.element.cells);
      const placeholderCells = Array.from(ctx.placeholder.cells);

      if (!ctx.getSavedCellWidths()) {
        ctx.setSavedCellWidths(cells.map((cell) => cell.style.width));
      }

      for (const [index, cell] of cells.entries()) {
        const placeholderCell = placeholderCells[index];

        cell.style.width = `${placeholderCell.getBoundingClientRect().width}px`;
      }
    }

    // Compute the shape from the CSS values we just set plus the logical
    // translate, rather than measuring the feedbackElement with DOMRectangle.
    // This avoids capturing in-flight CSS transition values when the
    // ResizeObserver fires before the browser has created the transition.
    const translate = ctx.getTranslate() ?? {x: 0, y: 0};
    const shapeLeft = ctx.left + dX + fixedOffset.x + translate.x;
    const shapeTop = ctx.top + dY + fixedOffset.y + translate.y;
    const shapeWidth = placeholderShape.width - ctx.widthOffset;
    const shapeHeight = placeholderShape.height - ctx.heightOffset;
    const ft = ctx.frameTransform;

    ctx.dragOperation.shape = new Rectangle(
      shapeLeft * ft.scaleX + ft.x,
      shapeTop * ft.scaleY + ft.y,
      shapeWidth * ft.scaleX,
      shapeHeight * ft.scaleY
    );
  });
}
