import {effect, untracked, type CleanupFunction} from '@dnd-kit/state';
import {Plugin} from '@dnd-kit/abstract';
import {
  animateTransform,
  createPlaceholder,
  DOMRectangle,
  getWindow,
  isKeyboardEvent,
  showPopover,
  supportsPopover,
  supportsStyle,
  Styles,
  type Transform,
} from '@dnd-kit/dom/utilities';
import {Coordinates} from '@dnd-kit/geometry';

import {DragDropManager} from '../../manager/index.js';

const CSS_PREFIX = '--dnd-kit-feedback-';
const css = `[data-dnd-kit-feedback] {position: fixed !important;pointer-events: none;touch-action: none;z-index: 999999;will-change: transform;top: var(${CSS_PREFIX}top, 0px) !important;left: var(${CSS_PREFIX}left, 0px) !important;width: var(${CSS_PREFIX}width, auto) !important;height: var(${CSS_PREFIX}height, auto) !important;margin: var(${CSS_PREFIX}margin, 0px) !important;padding: var(${CSS_PREFIX}padding, 0px) !important;}[data-dnd-kit-feedback][style*="${CSS_PREFIX}translate"] {transition: var(${CSS_PREFIX}transition) !important;translate: var(${CSS_PREFIX}translate) !important;}[data-dnd-kit-feedback][popover] {background: var(${CSS_PREFIX}background, inherit) !important;border: var(${CSS_PREFIX}border, inherit) !important;overflow: visible;}[data-dnd-kit-feedback]::backdrop {display: none}`;
const ATTRIBUTE = 'data-dnd-kit-feedback';
const IGNORED_ATTRIBUTES = [ATTRIBUTE, 'popover'];
const IGNORED_STYLES = ['view-transition-name'];

export class Feedback extends Plugin<DragDropManager> {
  public constructor(manager: DragDropManager) {
    super(manager);

    let style: HTMLStyleElement | undefined;
    let initialCoordinates: Coordinates | undefined;
    let currentTransform: Transform | undefined;
    let transformOrigin: Coordinates | undefined;
    let moved = false;

    const styleInjectionCleanup = effect(() => {
      if (!style && manager.dragOperation.status.initialized) {
        style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);

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
        moved = false;
        return;
      }

      if (!source) return;

      const {element, feedback} = source;

      if (!element || feedback === 'none') return;

      const shape = new DOMRectangle(element, true);
      const {width, height, top, left} = shape;
      const styles = new Styles(element);
      const {border, background, padding, margin, transition} =
        getWindow(element).getComputedStyle(element);
      const droppable = manager.registry.droppables.get(source.id);
      const clone = feedback === 'clone';
      const placeholder = createPlaceholder(element, clone);
      const isKeyboardOperation = untracked(() =>
        isKeyboardEvent(manager.dragOperation.activatorEvent)
      );

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

      element.setAttribute(ATTRIBUTE, '');
      styles.set(
        {
          width: width,
          height: height,
          top: projected.top,
          left: projected.left,
          padding,
          margin,
          border,
          background,
          translate: currentTransform
            ? `${currentTransform.x}px ${currentTransform.y}px 0`
            : '',
        },
        CSS_PREFIX
      );
      element.parentElement?.insertBefore(
        placeholder,
        element.nextElementSibling
      );

      if (supportsPopover(element)) {
        element.setAttribute('popover', '');
        showPopover(element);
      }

      const actual = new DOMRectangle(element, true);
      const offset = {
        top: projected.top - actual.top,
        left: projected.left - actual.left,
      };

      if (Math.abs(offset.top) || Math.abs(offset.left)) {
        styles.set(
          {
            top: projected.top + offset.top,
            left: projected.left + offset.left,
          },
          CSS_PREFIX
        );
      }

      const resizeObserver = new ResizeObserver(() => {
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

        manager.dragOperation.shape = new DOMRectangle(element);
      });

      if (droppable) {
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
      dragOperation.shape = shape;

      resizeObserver.observe(placeholder);

      const elementMutationObserver = new MutationObserver(() => {
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

      const parentMutationObserver = new MutationObserver((entries) => {
        for (const entry of entries) {
          if (Array.from(entry.addedNodes).includes(element)) {
            /* Update the position of the placeholder when the source element is moved */
            entry.target.insertBefore(placeholder, element.nextElementSibling);

            /*
             * Any update in DOM order that affects the source element hide the popover
             * so we need to force the source element to be promoted to the top layer again
             */
            showPopover(element);
          }
        }
      });

      if (element.parentElement) {
        /* Observe mutations on the element's parent node */
        parentMutationObserver.observe(element.parentElement, {
          childList: true,
        });
      }

      const cleanupEffect = effect(function updateTransform() {
        const {transform, status} = dragOperation;
        const {x, y} = transform;

        if (!x && !y && !moved) {
          return;
        }

        if (!moved) {
          moved = true;
        }

        if (status.dragging) {
          const translateTransition = isKeyboardOperation
            ? '250ms ease'
            : '0ms linear';

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

      let cleanup: CleanupFunction | undefined = () => {
        styles.reset();
        placeholder.remove();
        element.removeAttribute(ATTRIBUTE);

        if (supportsPopover(element)) {
          element.removeAttribute('popover');
        }

        cleanupEffect();
        dropEffectCleanup();
        elementMutationObserver.disconnect();
        parentMutationObserver.disconnect();
        resizeObserver.disconnect();

        if (droppable) {
          droppable.placeholder = undefined;
        }
      };

      const dropEffectCleanup = effect(function dropAnimation() {
        if (dragOperation.status.dropping) {
          const onComplete = cleanup;
          cleanup = undefined;

          const transform = currentTransform;

          if (!transform) {
            onComplete?.();
            return;
          }

          manager.renderer.rendering.then(() => {
            /* Force the source element to be promoted to the top layer before animating it */
            showPopover(element);

            const shape = new DOMRectangle(placeholder, true);
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
              onReady() {
                styles.remove(['translate', 'transition'], CSS_PREFIX);
              },
              onFinish() {
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
