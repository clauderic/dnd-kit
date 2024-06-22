import {effect, untracked, type CleanupFunction} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {
  animateTransform,
  createPlaceholder,
  DOMRectangle,
  isKeyboardEvent,
  showPopover,
  getComputedStyles,
  supportsPopover,
  supportsStyle,
  Styles,
  type Transform,
  parseTranslate,
} from '@dnd-kit/dom/utilities';
import {Coordinates} from '@dnd-kit/geometry';

import {DragDropManager} from '../../manager/index.ts';

const ATTR_PREFIX = 'data-dnd-';
const CSS_PREFIX = '--dnd-';
const ATTRIBUTE = `${ATTR_PREFIX}dragging`;
const cssRules = `[${ATTRIBUTE}] {position: fixed !important; pointer-events: none !important; touch-action: none !important; z-index: calc(infinity); will-change: transform;top: var(${CSS_PREFIX}top, 0px) !important;left: var(${CSS_PREFIX}left, 0px) !important;width: var(${CSS_PREFIX}width, auto) !important;height: var(${CSS_PREFIX}height, auto) !important;}[${ATTRIBUTE}] *{pointer-events: none !important;}[${ATTRIBUTE}][style*="${CSS_PREFIX}translate"] {translate: var(${CSS_PREFIX}translate) !important;}[style*="${CSS_PREFIX}transition"] {transition: var(${CSS_PREFIX}transition) !important;}*:where([${ATTRIBUTE}][popover]){overflow:visible;background:var(${CSS_PREFIX}background);border:var(${CSS_PREFIX}border);margin:unset;padding:unset;color:inherit;}[${ATTRIBUTE}]::backdrop {display: none}`;
const PLACEHOLDER_ATTRIBUTE = `${ATTR_PREFIX}placeholder`;
const IGNORED_ATTRIBUTES = [ATTRIBUTE, PLACEHOLDER_ATTRIBUTE, 'popover'];
const IGNORED_STYLES = ['view-transition-name'];

export class Feedback extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager) {
    super(manager);

    let style: HTMLStyleElement | undefined;
    let initialCoordinates: Coordinates | undefined;
    let initialTranslate: Coordinates = {x: 0, y: 0};
    let currentTransform: Transform | undefined;
    let transformOrigin: Coordinates | undefined;
    let moved = false;

    const styleInjectionCleanup = effect(() => {
      if (!style && manager.dragOperation.status.initialized) {
        style = document.createElement('style');
        style.innerText = cssRules;
        document.head.prepend(style);

        return styleInjectionCleanup;
      }
    });

    const cleanupEffect = effect(() => {
      const {dragOperation} = manager;
      const {position, source, status} = dragOperation;

      if (status.idle) {
        initialCoordinates = undefined;
        currentTransform = undefined;
        transformOrigin = undefined;
        initialTranslate = {x: 0, y: 0};
        return;
      }

      if (!source) return;

      const {element, feedback} = source;

      if (!element || feedback === 'none') return;

      const shape = new DOMRectangle(element, true);
      const {width, height, top, left} = shape;
      const styles = new Styles(element);
      const {background, border, transition, translate} =
        getComputedStyles(element);
      const droppable = manager.registry.droppables.get(source.id);
      const clone = feedback === 'clone';
      const placeholder =
        feedback !== 'move'
          ? createPlaceholder(element, clone, {
              [PLACEHOLDER_ATTRIBUTE]: '',
            })
          : null;
      const isKeyboardOperation = untracked(() =>
        isKeyboardEvent(manager.dragOperation.activatorEvent)
      );

      if (translate !== 'none') {
        const parsedTranslate = parseTranslate(translate);

        if (parsedTranslate) {
          initialTranslate = parsedTranslate;
        }
      }

      if (!initialCoordinates) {
        initialCoordinates = {
          x: left,
          y: top,
        };
      }

      if (!transformOrigin) {
        const currentPosition = untracked(() => position.current);
        transformOrigin = {
          x: (currentPosition.x - left) / width,
          y: (currentPosition.y - top) / height,
        };
      }

      const delta = {
        x: initialCoordinates.x - left,
        y: initialCoordinates.y - top,
      };
      const projected = {
        top: top + delta.y,
        left: left + delta.x,
      };

      element.setAttribute(ATTRIBUTE, 'true');
      styles.set(
        {
          width: width,
          height: height,
          top: projected.top,
          left: projected.left,
          background,
          border,
          translate: currentTransform
            ? `${currentTransform.x}px ${currentTransform.y}px 0`
            : '',
        },
        CSS_PREFIX
      );

      if (placeholder) element.insertAdjacentElement('afterend', placeholder);

      if (supportsPopover(element)) {
        if (!element.hasAttribute('popover')) {
          element.setAttribute('popover', '');
        }
        showPopover(element);
      }

      const actual = new DOMRectangle(element, true);
      const offset = {
        top: projected.top - actual.top,
        left: projected.left - actual.left,
      };

      if (offset.left > 0.01 || offset.top > 0.01) {
        styles.set(
          {
            top: projected.top + offset.top,
            left: projected.left + offset.left,
          },
          CSS_PREFIX
        );
      } else {
        // Ignore sub-pixel offsets
        offset.left = 0;
        offset.top = 0;
      }

      const resizeObserver = new ResizeObserver(() => {
        if (!placeholder) return;

        const placeholderShape = new DOMRectangle(placeholder, true);
        const origin = transformOrigin ?? {x: 1, y: 1};
        const dX = (width - placeholderShape.width) * origin.x + delta.x;
        const dY = (height - placeholderShape.height) * origin.y + delta.y;

        styles.set(
          {
            width: placeholderShape.width,
            height: placeholderShape.height,
            top: top + dY + offset.top,
            left: left + dX + offset.left,
          },
          CSS_PREFIX
        );

        /* Table cells need to have their width set explicitly because the feedback element is position fixed */
        if (
          element instanceof HTMLTableRowElement &&
          placeholder instanceof HTMLTableRowElement
        ) {
          const cells = Array.from(element.cells);
          const placeholderCells = Array.from(placeholder.cells);

          for (const [index, cell] of cells.entries()) {
            const placeholderCell = placeholderCells[index];

            cell.style.width = `${placeholderCell.offsetWidth}px`;
          }
        }

        manager.dragOperation.shape = new DOMRectangle(element);
      });

      if (droppable && placeholder) {
        /*
         * If there is a droppable with the same id as the draggable source
         * set the placeholder as the droppable's placeholder, which takes
         * precedence over the dorppable's `element` property when computing
         * its shape.
         */
        droppable.placeholder = placeholder;
        untracked(droppable.refreshShape);
      }

      /* Initialize drag operation shape */
      dragOperation.shape = new DOMRectangle(element);
      source.status = 'dragging';

      let elementMutationObserver: MutationObserver | undefined;
      let documentMutationObserver: MutationObserver | undefined;

      if (placeholder) {
        resizeObserver.observe(placeholder);

        elementMutationObserver = new MutationObserver(() => {
          for (const attribute of Array.from(element.attributes)) {
            if (
              attribute.name.startsWith('aria-') ||
              IGNORED_ATTRIBUTES.includes(attribute.name)
            ) {
              continue;
            }

            if (attribute.name === 'style') {
              if (supportsStyle(element) && supportsStyle(placeholder)) {
                placeholder.setAttribute('style', clone ? '' : 'opacity: 0;');
                placeholder.style.setProperty('transition', 'none');

                for (const key of Object.values(element.style)) {
                  if (
                    key.startsWith(CSS_PREFIX) ||
                    IGNORED_STYLES.includes(key)
                  ) {
                    continue;
                  }

                  placeholder.style.setProperty(
                    key,
                    element.style.getPropertyValue(key)
                  );
                }
              }
              continue;
            }

            placeholder.setAttribute(attribute.name, attribute.value);
          }

          if (clone) {
            placeholder.innerHTML = element.innerHTML;
          }
        });

        elementMutationObserver.observe(element, {
          attributes: true,
          subtree: true,
        });

        documentMutationObserver = new MutationObserver((entries) => {
          for (const entry of entries) {
            if (Array.from(entry.addedNodes).includes(element)) {
              /* Update the position of the placeholder when the source element is moved */
              element.insertAdjacentElement('afterend', placeholder);

              /*
               * Any update in DOM order that affects the source element hides the popover
               * so we need to force the source element to be promoted to the top layer again
               */
              showPopover(element);
              return;
            }
          }
        });

        /* Observe mutations on the element's owner document body */
        documentMutationObserver.observe(element.ownerDocument.body, {
          childList: true,
          subtree: true,
        });
      }

      const cleanupEffect = effect(function updateTransform() {
        const {transform, status} = dragOperation;

        if (!transform.x && !transform.y && !moved) {
          return;
        }

        if (!moved) {
          moved = true;
        }

        if (status.dragging) {
          const translateTransition = isKeyboardOperation
            ? '250ms ease'
            : '0ms linear';

          const x = transform.x + initialTranslate.x;
          const y = transform.y + initialTranslate.y;

          const shape = new DOMRectangle(element);

          styles.set(
            {
              transition: `${transition}, translate ${translateTransition}`,
              translate: `${x}px ${y}px 0`,
            },
            CSS_PREFIX
          );

          dragOperation.shape = shape.translate(
            x - (currentTransform?.x ?? 0),
            y - (currentTransform?.y ?? 0)
          );

          currentTransform = {
            x,
            y,
            z: 0,
            scaleX: shape.scale.x,
            scaleY: shape.scale.y,
          };
        }
      });

      const id = manager.dragOperation.source?.id;

      const restoreFocus = () => {
        if (!isKeyboardOperation || id == null) {
          return;
        }

        const draggable = manager.registry.draggables.get(id);
        const element = draggable?.handle ?? draggable?.element;

        if (element instanceof HTMLElement) {
          element.focus();
        }
      };

      let cleanup: CleanupFunction | undefined = () => {
        elementMutationObserver?.disconnect();
        documentMutationObserver?.disconnect();
        resizeObserver.disconnect();

        styles.reset();

        if (moved && element.isConnected) {
          placeholder?.replaceWith(element);
        }

        placeholder?.remove();
        element.removeAttribute(ATTRIBUTE);

        if (supportsPopover(element)) {
          element.removeAttribute('popover');
        }

        cleanupEffect();
        dropEffectCleanup();

        if (droppable) {
          droppable.placeholder = undefined;
        }

        source.status = 'idle';

        moved = false;
      };

      const dropEffectCleanup = effect(function dropAnimation() {
        if (dragOperation.status.dropped) {
          const onComplete = cleanup;
          cleanup = undefined;

          source.status = 'dropping';

          const transform = currentTransform;

          if (!transform) {
            onComplete?.();
            return;
          }

          manager.renderer.rendering.then(() => {
            /* Force the source element to be promoted to the top layer before animating it */
            showPopover(element);

            const target = placeholder ?? element;

            styles.remove(['translate'], CSS_PREFIX);

            const shape = new DOMRectangle(target);
            const currentShape = new DOMRectangle(element, true).translate(
              transform.x,
              transform.y
            );
            const delta = {
              x: currentShape.center.x - shape.center.x,
              y: currentShape.center.y - shape.center.y,
            };
            const final = {
              x: transform.x - delta.x,
              y: transform.y - delta.y,
              z: 0,
            };

            animateTransform({
              element,
              keyframes: {
                translate: [
                  `${transform.x}px ${transform.y}px ${transform.z ?? 0}`,
                  `${final.x}px ${final.y}px ${final.z}`,
                ],
              },
              options: {
                duration: moved ? 250 : 0,
                easing: 'ease',
              },
              onFinish() {
                requestAnimationFrame(restoreFocus);
                onComplete?.();
              },
            });
          });
        }
      });

      return () => cleanup?.();
    });

    this.destroy = () => {
      styleInjectionCleanup();
      cleanupEffect();
      style?.remove();
    };
  }
}
