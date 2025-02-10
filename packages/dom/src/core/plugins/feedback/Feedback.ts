import {
  effect,
  reactive,
  untracked,
  type CleanupFunction,
} from '@dnd-kit/state';
import {configurator, Plugin} from '@dnd-kit/abstract';
import {
  animateTransform,
  DOMRectangle,
  isKeyboardEvent,
  getComputedStyles,
  getDocument,
  getFrameTransform,
  getWindow,
  parseTranslate,
  showPopover,
  supportsPopover,
  supportsStyle,
  Styles,
} from '@dnd-kit/dom/utilities';
import {Coordinates, Rectangle} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';

import {
  ATTRIBUTE,
  CSS_PREFIX,
  CSS_RULES,
  IGNORED_ATTRIBUTES,
  IGNORED_STYLES,
} from './constants.ts';
import {
  createPlaceholder,
  isSameFrame,
  preventPopoverClose,
} from './utilities.ts';

export interface FeedbackOptions {
  rootElement?: Element | ((source: Draggable) => Element);
}

interface State {
  current: {
    translate?: Coordinates;
  };
  initial: {
    dimensions?: {width: number; height: number};
    coordinates?: Coordinates;
    frameTransform?: {x: number; y: number; scaleX: number; scaleY: number};
    translate?: Coordinates;
    transformOrigin?: Coordinates;
  };
}

export class Feedback extends Plugin<DragDropManager, FeedbackOptions> {
  @reactive
  public accessor overlay: Element | undefined;

  private state: State = {
    initial: {},
    current: {},
  };

  constructor(manager: DragDropManager, options?: FeedbackOptions) {
    super(manager);

    this.registerEffect(this.#injectStyles);
    this.registerEffect(this.#render);
  }

  #render() {
    const {state, manager, options} = this;
    const {dragOperation} = manager;
    const {position, source, status} = dragOperation;

    if (status.idle) {
      state.current = {};
      state.initial = {};
      return;
    }

    if (!source) return;

    const {element, feedback} = source;

    if (!element || feedback === 'none' || status.initializing) {
      return;
    }

    const {initial} = state;
    const feedbackElement = this.overlay ?? element;
    const frameTransform = getFrameTransform(feedbackElement);
    const elementFrameTransform = getFrameTransform(element);
    const crossFrame = !isSameFrame(element, feedbackElement);
    const shape = new DOMRectangle(element, {
      frameTransform: crossFrame ? elementFrameTransform : null,
      ignoreTransforms: !crossFrame,
    });
    const scaleDelta = {
      x: elementFrameTransform.scaleX / frameTransform.scaleX,
      y: elementFrameTransform.scaleY / frameTransform.scaleY,
    };

    let cleanup: CleanupFunction | undefined;
    let {width, height, top, left} = shape;

    if (crossFrame) {
      width = width / scaleDelta.x;
      height = height / scaleDelta.y;
    }

    const styles = new Styles(feedbackElement);
    const {transition, translate} = getComputedStyles(element);
    const clone = feedback === 'clone';

    const placeholder =
      feedback !== 'move' && !this.overlay ? createPlaceholder(source) : null;
    const isKeyboardOperation = untracked(() =>
      isKeyboardEvent(manager.dragOperation.activatorEvent)
    );

    if (translate !== 'none') {
      const parsedTranslate = parseTranslate(translate);

      if (parsedTranslate && !initial.translate) {
        initial.translate = parsedTranslate;
      }
    }

    if (!initial.transformOrigin) {
      const current = untracked(() => position.current);

      initial.transformOrigin = {
        x:
          (current.x - left * frameTransform.scaleX - frameTransform.x) /
          (width * frameTransform.scaleX),
        y:
          (current.y - top * frameTransform.scaleY - frameTransform.y) /
          (height * frameTransform.scaleY),
      };
    }

    const {transformOrigin} = initial;
    const relativeTop = top * frameTransform.scaleY + frameTransform.y;
    const relativeLeft = left * frameTransform.scaleX + frameTransform.x;

    if (!initial.coordinates) {
      initial.coordinates = {
        x: relativeLeft,
        y: relativeTop,
      };

      // Compoensate for transformOrigin when scaling
      if (scaleDelta.x !== 1 || scaleDelta.y !== 1) {
        const {scaleX, scaleY} = elementFrameTransform;
        const {x: tX, y: tY} = transformOrigin;

        initial.coordinates.x += (width * scaleX - width) * tX;
        initial.coordinates.y += (height * scaleY - height) * tY;
      }
    }

    if (!initial.dimensions) {
      initial.dimensions = {width, height};
    }

    if (!initial.frameTransform) {
      initial.frameTransform = frameTransform;
    }

    const coordinatesDelta = {
      x: initial.coordinates.x - relativeLeft,
      y: initial.coordinates.y - relativeTop,
    };

    const sizeDelta = {
      width:
        (initial.dimensions.width * initial.frameTransform.scaleX -
          width * frameTransform.scaleX) *
        transformOrigin.x,
      height:
        (initial.dimensions.height * initial.frameTransform.scaleY -
          height * frameTransform.scaleY) *
        transformOrigin.y,
    };

    const delta = {
      x: coordinatesDelta.x / frameTransform.scaleX + sizeDelta.width,
      y: coordinatesDelta.y / frameTransform.scaleY + sizeDelta.height,
    };

    const projected = {
      left: left + delta.x,
      top: top + delta.y,
    };

    feedbackElement.setAttribute(ATTRIBUTE, 'true');

    const transform = untracked(() => dragOperation.transform);
    const initialTranslate = initial.translate ?? {x: 0, y: 0};
    const tX = transform.x * frameTransform.scaleX + initialTranslate.x;
    const tY = transform.y * frameTransform.scaleY + initialTranslate.y;
    const translateString = `${tX}px ${tY}px 0`;

    styles.set(
      {
        width: width,
        height: height,
        top: projected.top,
        left: projected.left,
        translate: translateString,
        scale: crossFrame ? `${scaleDelta.x} ${scaleDelta.y}` : '',
        'transform-origin': `${transformOrigin.x * 100}% ${transformOrigin.y * 100}%`,
      },
      CSS_PREFIX
    );

    if (placeholder) {
      element.insertAdjacentElement('afterend', placeholder);

      if (options?.rootElement) {
        const root =
          typeof options.rootElement === 'function'
            ? options.rootElement(source)
            : options.rootElement;

        root.appendChild(element);
      }
    }

    if (supportsPopover(feedbackElement)) {
      if (!feedbackElement.hasAttribute('popover')) {
        feedbackElement.setAttribute('popover', '');
      }
      showPopover(feedbackElement);
      feedbackElement.addEventListener('beforetoggle', preventPopoverClose);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!placeholder) return;

      const placeholderShape = new DOMRectangle(placeholder, {
        frameTransform,
        ignoreTransforms: true,
      });
      const origin = transformOrigin ?? {x: 1, y: 1};
      const dX = (width - placeholderShape.width) * origin.x + delta.x;
      const dY = (height - placeholderShape.height) * origin.y + delta.y;

      styles.set(
        {
          width: placeholderShape.width,
          height: placeholderShape.height,
          top: top + dY,
          left: left + dX,
        },
        CSS_PREFIX
      );

      const window = getWindow(element);

      /* Table cells need to have their width set explicitly because the feedback element is position fixed */
      if (
        element instanceof window.HTMLTableRowElement &&
        placeholder instanceof window.HTMLTableRowElement
      ) {
        const cells = Array.from(element.cells);
        const placeholderCells = Array.from(placeholder.cells);

        for (const [index, cell] of cells.entries()) {
          const placeholderCell = placeholderCells[index];

          cell.style.width = `${placeholderCell.offsetWidth}px`;
        }
      }

      dragOperation.shape = new DOMRectangle(element);
    });

    /* Initialize drag operation shape */
    dragOperation.shape = new DOMRectangle(feedbackElement);

    if (untracked(() => source.status) === 'idle') {
      requestAnimationFrame(() => (source.status = 'dragging'));
    }

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

      /* Make sure the placeholder and the source element positions are always in sync */
      documentMutationObserver = new MutationObserver((entries) => {
        for (const entry of entries) {
          if (entry.addedNodes.length === 0) continue;

          for (const node of Array.from(entry.addedNodes)) {
            if (
              node.contains(element) &&
              element.nextElementSibling !== placeholder
            ) {
              /* Update the position of the placeholder when the source element is moved */
              element.insertAdjacentElement('afterend', placeholder);
              /* Force the source element to be promoted back to the top layer */
              showPopover(feedbackElement);
              return;
            }

            if (
              node.contains(placeholder) &&
              placeholder.previousElementSibling !== element
            ) {
              /* Update the position of the source element when the placeholder is moved */
              placeholder.insertAdjacentElement('beforebegin', element);
              /* Force the source element to be promoted back to the top layer */
              showPopover(feedbackElement);
              return;
            }
          }
        }
      });

      /* Observe mutations on the element's owner document body */
      documentMutationObserver.observe(element.ownerDocument.body, {
        childList: true,
        subtree: true,
      });
    }

    // Update transform on move
    const cleanupEffect = effect(() => {
      const {transform, status} = dragOperation;

      if (!transform.x && !transform.y && !state.current.translate) {
        return;
      }

      if (status.dragging) {
        const translateTransition = isKeyboardOperation
          ? '250ms cubic-bezier(0.25, 1, 0.5, 1)'
          : '0ms linear';

        const initialTranslate = initial.translate ?? {x: 0, y: 0};
        const x = transform.x / frameTransform.scaleX + initialTranslate.x;
        const y = transform.y / frameTransform.scaleY + initialTranslate.y;

        styles.set(
          {
            transition: `${transition}, translate ${translateTransition}`,
            translate: `${x}px ${y}px 0`,
          },
          CSS_PREFIX
        );

        dragOperation.shape = new DOMRectangle(feedbackElement);

        state.current.translate = {
          x,
          y,
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

    let dropEffectCleanup: CleanupFunction | undefined;
    cleanup = () => {
      elementMutationObserver?.disconnect();
      documentMutationObserver?.disconnect();
      resizeObserver.disconnect();

      if (supportsPopover(feedbackElement)) {
        feedbackElement.removeEventListener(
          'beforetoggle',
          preventPopoverClose
        );
        feedbackElement.removeAttribute('popover');
      }

      feedbackElement.removeAttribute(ATTRIBUTE);
      styles.reset();

      source.status = 'idle';

      const moved = state.current.translate != null;

      if (
        placeholder &&
        (moved ||
          placeholder.parentElement !== feedbackElement.parentElement) &&
        feedbackElement.isConnected
      ) {
        placeholder.replaceWith(feedbackElement);
      }

      placeholder?.remove();

      cleanupEffect();
      dropEffectCleanup?.();
    };

    // Drop animation
    dropEffectCleanup = effect(() => {
      if (dragOperation.status.dropped) {
        const onComplete = cleanup;
        cleanup = undefined;

        source.status = 'dropping';

        let translate = state.current.translate;
        const moved = translate != null;

        if (!translate && element !== feedbackElement) {
          translate = {
            x: 0,
            y: 0,
          };
        }

        if (!translate) {
          onComplete?.();
          return;
        }

        manager.renderer.rendering.then(() => {
          /* Force the source element to be promoted to the top layer before animating it */
          showPopover(feedbackElement);

          const target = placeholder ?? element;
          const animations = feedbackElement.getAnimations();

          if (animations.length) {
            animations.forEach((animation) => {
              const {effect} = animation;

              if (effect instanceof KeyframeEffect) {
                if (
                  effect.getKeyframes().some((keyframe) => keyframe.translate)
                ) {
                  animation.finish();
                }
              }
            });
          }

          const options = {
            frameTransform: isSameFrame(feedbackElement, target)
              ? null
              : undefined,
          };
          const current = new DOMRectangle(feedbackElement, options);
          const final = new DOMRectangle(target, options);
          const delta = Rectangle.delta(current, final, source.alignment);
          const finalTranslate = {
            x: translate.x - delta.x,
            y: translate.y - delta.y,
          };
          const heightKeyframes =
            Math.round(current.intrinsicHeight) !==
            Math.round(final.intrinsicHeight)
              ? {
                  minHeight: [
                    `${current.intrinsicHeight}px`,
                    `${final.intrinsicHeight}px`,
                  ],
                  maxHeight: [
                    `${current.intrinsicHeight}px`,
                    `${final.intrinsicHeight}px`,
                  ],
                }
              : {};
          const widthKeyframes =
            Math.round(current.intrinsicWidth) !==
            Math.round(final.intrinsicWidth)
              ? {
                  minWidth: [
                    `${current.intrinsicWidth}px`,
                    `${final.intrinsicWidth}px`,
                  ],
                  maxWidth: [
                    `${current.intrinsicWidth}px`,
                    `${final.intrinsicWidth}px`,
                  ],
                }
              : {};

          animateTransform({
            element: feedbackElement,
            keyframes: {
              ...heightKeyframes,
              ...widthKeyframes,
              translate: [
                `${translate.x}px ${translate.y}px 0`,
                `${finalTranslate.x}px ${finalTranslate.y}px 0`,
              ],
            },
            options: {
              duration: moved || feedbackElement !== element ? 250 : 0,
              easing: 'ease',
            },
            onReady() {
              styles.remove(['translate'], CSS_PREFIX);
            },
            onFinish() {
              onComplete?.();
              requestAnimationFrame(restoreFocus);
            },
          });
        });
      }
    });

    return () => cleanup?.();
  }

  #injectStyles() {
    const {status, source, target} = this.manager.dragOperation;

    if (status.initialized) {
      const sourceDocument = getDocument(source?.element ?? null);
      const targetDocument = getDocument(target?.element ?? null);
      const documents = new Set([sourceDocument, targetDocument]);

      for (const doc of documents) {
        if (!injectedStyleTags.has(doc)) {
          const style = document.createElement('style');
          style.innerText = CSS_RULES;
          doc.head.prepend(style);
          injectedStyleTags.set(doc, style);
        }
      }
    }
  }

  public destroy(): void {
    super.destroy();

    injectedStyleTags.forEach((style) => style.remove());
    injectedStyleTags.clear();
  }

  static configure = configurator(Feedback);
}

const injectedStyleTags = new Map<Document, HTMLStyleElement>();
