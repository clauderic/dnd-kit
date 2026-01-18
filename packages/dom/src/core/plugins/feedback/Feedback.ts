import {
  effects,
  reactive,
  untracked,
  derived,
  type CleanupFunction,
} from '@dnd-kit/state';
import {configurator, Plugin} from '@dnd-kit/abstract';
import {
  animateTransform,
  DOMRectangle,
  getComputedStyles,
  getRoot,
  getFinalKeyframe,
  getFrameTransform,
  getWindow,
  isHTMLElement,
  isDocument,
  isShadowRoot,
  isKeyboardEvent,
  parseTranslate,
  showPopover,
  Styles,
  supportsPopover,
  supportsStyle,
} from '@dnd-kit/dom/utilities';
import {Coordinates, Point, Rectangle} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';

import {
  ATTRIBUTE,
  CSS_PREFIX,
  CSS_RULES,
  DROPPING_ATTRIBUTE,
  IGNORED_ATTRIBUTES,
  IGNORED_STYLES,
} from './constants.ts';
import {
  createPlaceholder,
  isSameFrame,
  isTableRow,
  preventPopoverClose,
} from './utilities.ts';

export interface FeedbackOptions {
  rootElement?: Element | ((source: Draggable) => Element);
  nonce?: string;
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

interface StyleSheetRegistration {
  cleanup: CleanupFunction;
  instances: Set<Feedback>;
}

const styleSheetRegistry = new Map<Document | ShadowRoot, StyleSheetRegistration>();

export class Feedback extends Plugin<DragDropManager, FeedbackOptions> {
  @reactive
  public accessor overlay: Element | undefined;

  private state: State = {
    initial: {},
    current: {},
  };

  constructor(manager: DragDropManager, options?: FeedbackOptions) {
    super(manager, options);

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

    if (
      !element ||
      feedback === 'none' ||
      !status.initialized ||
      status.initializing
    ) {
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

    let {width, height, top, left} = shape;

    if (crossFrame) {
      width = width / scaleDelta.x;
      height = height / scaleDelta.y;
    }

    let elementMutationObserver: MutationObserver | undefined;
    let documentMutationObserver: MutationObserver | undefined;
    const styles = new Styles(feedbackElement);
    const {
      transition,
      translate,
      boxSizing,
      paddingBlockStart,
      paddingBlockEnd,
      paddingInlineStart,
      paddingInlineEnd,
      borderInlineStartWidth,
      borderInlineEndWidth,
      borderBlockStartWidth,
      borderBlockEndWidth,
    } = getComputedStyles(element);
    const clone = feedback === 'clone';
    const contentBox = boxSizing === 'content-box';
    const widthOffset = contentBox
      ? parseInt(paddingInlineStart) +
        parseInt(paddingInlineEnd) +
        parseInt(borderInlineStartWidth) +
        parseInt(borderInlineEndWidth)
      : 0;
    const heightOffset = contentBox
      ? parseInt(paddingBlockStart) +
        parseInt(paddingBlockEnd) +
        parseInt(borderBlockStartWidth) +
        parseInt(borderBlockEndWidth)
      : 0;

    const placeholder =
      feedback !== 'move' && !this.overlay
        ? createPlaceholder(source, clone ? 'clone' : 'hidden')
        : null;
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
    const transitionString = transition
      ? `${transition}, translate 0ms linear`
      : '';

    styles.set(
      {
        width: width - widthOffset,
        height: height - heightOffset,
        top: projected.top,
        left: projected.left,
        translate: translateString,
        transition: transitionString,
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
        feedbackElement.setAttribute('popover', 'manual');
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
          width: placeholderShape.width - widthOffset,
          height: placeholderShape.height - heightOffset,
          top: top + dY,
          left: left + dX,
        },
        CSS_PREFIX
      );
      elementMutationObserver?.takeRecords();

      /* Table cells need to have their width set explicitly because the feedback element is position fixed */
      if (isTableRow(element) && isTableRow(placeholder)) {
        const cells = Array.from(element.cells);
        const placeholderCells = Array.from(placeholder.cells);

        for (const [index, cell] of cells.entries()) {
          const placeholderCell = placeholderCells[index];

          cell.style.width = `${placeholderCell.offsetWidth}px`;
        }
      }

      dragOperation.shape = new DOMRectangle(feedbackElement);
    });

    /* Initialize drag operation shape */
    const initialShape = new DOMRectangle(feedbackElement);
    untracked(() => (dragOperation.shape = initialShape));

    const feedbackWindow = getWindow(feedbackElement);
    const handleWindowResize = (event: Event) => {
      this.manager.actions.stop({event});
    };

    if (isKeyboardOperation) {
      feedbackWindow.addEventListener('resize', handleWindowResize);
    }

    if (untracked(() => source.status) === 'idle') {
      requestAnimationFrame(() => (source.status = 'dragging'));
    }

    if (placeholder) {
      resizeObserver.observe(placeholder);

      elementMutationObserver = new MutationObserver((mutations) => {
        let hasChildrenMutations = false;

        for (const mutation of mutations) {
          if (mutation.target !== element) {
            hasChildrenMutations = true;
            continue;
          }

          if (mutation.type !== 'attributes') {
            // Should never happen, but defensive programming just in case
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

      elementMutationObserver.observe(element, {
        attributes: true,
        subtree: true,
        childList: true,
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

    const id = manager.dragOperation.source?.id;

    const restoreFocus = () => {
      if (!isKeyboardOperation || id == null) {
        return;
      }

      const draggable = manager.registry.draggables.get(id);
      const element = draggable?.handle ?? draggable?.element;

      if (isHTMLElement(element)) {
        element.focus();
      }
    };
    const cleanup = () => {
      elementMutationObserver?.disconnect();
      documentMutationObserver?.disconnect();
      resizeObserver.disconnect();
      feedbackWindow.removeEventListener('resize', handleWindowResize);

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
    };

    const cleanupEffects = effects(
      // Update transform on move
      () => {
        const {transform, status} = dragOperation;

        if (!transform.x && !transform.y && !state.current.translate) {
          return;
        }

        if (status.dragging) {
          const initialTranslate = initial.translate ?? {x: 0, y: 0};
          const translate = {
            x: transform.x / frameTransform.scaleX + initialTranslate.x,
            y: transform.y / frameTransform.scaleY + initialTranslate.y,
          };
          const previousTranslate = state.current.translate;
          const modifiers = untracked(() => dragOperation.modifiers);
          const currentShape = untracked(() => dragOperation.shape?.current);
          const translateTransition = isKeyboardOperation
            ? '250ms cubic-bezier(0.25, 1, 0.5, 1)'
            : '0ms linear';

          styles.set(
            {
              transition: `${transition}, translate ${translateTransition}`,
              translate: `${translate.x}px ${translate.y}px 0`,
            },
            CSS_PREFIX
          );
          elementMutationObserver?.takeRecords();

          if (
            currentShape &&
            currentShape !== initialShape &&
            previousTranslate &&
            !modifiers.length
          ) {
            const delta = Point.delta(translate, previousTranslate);

            dragOperation.shape = Rectangle.from(
              currentShape.boundingRectangle
            ).translate(
              // Need to take into account frame transform when optimistically updating shape
              delta.x * frameTransform.scaleX,
              delta.y * frameTransform.scaleY
            );
          } else {
            dragOperation.shape = new DOMRectangle(feedbackElement);
          }

          state.current.translate = translate;
        }
      },
      // Drop animation
      function () {
        if (dragOperation.status.dropped) {
          // Dispose of the effect
          this.dispose();

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
            cleanup();
            return;
          }

          const dropAnimation = () => {
            {
              /* Force the source element to be promoted to the top layer before animating it */
              showPopover(feedbackElement);

              // Pause any translate transitions that are running on the feedback element
              const [, animation] =
                getFinalKeyframe(
                  feedbackElement,
                  (keyframe) => 'translate' in keyframe
                ) ?? [];

              animation?.pause();

              const target = placeholder ?? element;
              const options = {
                frameTransform: isSameFrame(feedbackElement, target)
                  ? null
                  : undefined,
              };
              const current = new DOMRectangle(feedbackElement, options);
              // With a keyboard activator, since there is a transition on the translate property,
              // the translate value may not be the same as the computed value if the transition is still running.
              const currentTranslate =
                parseTranslate(getComputedStyles(feedbackElement).translate) ??
                translate;
              const final = new DOMRectangle(target, options);
              const delta = Rectangle.delta(current, final, source.alignment);
              const finalTranslate = {
                x: currentTranslate.x - delta.x,
                y: currentTranslate.y - delta.y,
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

              styles.set({transition}, CSS_PREFIX);
              feedbackElement.setAttribute(DROPPING_ATTRIBUTE, '');
              elementMutationObserver?.takeRecords();

              animateTransform({
                element: feedbackElement,
                keyframes: {
                  ...heightKeyframes,
                  ...widthKeyframes,
                  translate: [
                    `${currentTranslate.x}px ${currentTranslate.y}px 0`,
                    `${finalTranslate.x}px ${finalTranslate.y}px 0`,
                  ],
                },
                options: {
                  duration: moved || feedbackElement !== element ? 250 : 0,
                  easing: 'ease',
                },
              }).then(() => {
                feedbackElement.removeAttribute(DROPPING_ATTRIBUTE);
                animation?.finish();
                cleanup();
                requestAnimationFrame(restoreFocus);
              });
            }
          };

          manager.renderer.rendering.then(dropAnimation);
        }
      }
    );

    return () => {
      cleanup();
      cleanupEffects();
    };
  }

  @derived
  private get sourceRoot() {
    const {source} = this.manager.dragOperation;
    return getRoot(source?.element ?? null);
  }

  @derived
  private get targetRoot() {
    const {target} = this.manager.dragOperation;
    return getRoot(target?.element ?? null);
  }

  @derived
  private get roots(): Set<Document | ShadowRoot> {
    const {status} = this.manager.dragOperation;

    if (status.initializing || status.initialized) {
      const roots = [this.sourceRoot, this.targetRoot].filter(root => root != null);
      return new Set(roots);
    }

    return new Set();
  }

  #injectStyles() {
    const {roots} = this;

    for (const root of roots) {
      let registration = styleSheetRegistry.get(root);

      if (!registration) {
        // check adoptedStyleSheets support
        if (
          !(
            'adoptedStyleSheets' in root &&
            Array.isArray(root.adoptedStyleSheets)
          ) && process.env.NODE_ENV !== 'production'
        ) {
          console.error("Cannot inject styles: This browser doesn't support adoptedStyleSheets");
        }

        // Get the CSSStyleSheet constructor from the target document's context
        // This is necessary because CSSStyleSheet instances cannot be shared across documents
        // (e.g., between a parent document and a same-origin iframe)
        const targetWindow = isDocument(root)
          ? root.defaultView
          : root.ownerDocument.defaultView;
        const {CSSStyleSheet} = targetWindow ?? {};

        if (!CSSStyleSheet) {
          if (process.env.NODE_ENV !== 'production') {
            console.error("Cannot inject styles: CSSStyleSheet constructor not available");
          }
          continue;
        }

        // Create the stylesheet in the target document's context
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(CSS_RULES);
        root.adoptedStyleSheets.push(sheet);

        registration = {
          cleanup: () => {
            if (
              isDocument(root) ||
              (isShadowRoot(root) && root.host?.isConnected)
            ) {
              // remove the stylesheet from the root's adoptedStyleSheets
              const index = root.adoptedStyleSheets.indexOf(sheet);
              if (index != -1) {
                root.adoptedStyleSheets.splice(index, 1);
              }
            }
          },
          instances: new Set(),
        };
        styleSheetRegistry.set(root, registration);
      }

      // Track this instance for this document
      registration.instances.add(this);
    }
  }

  public destroy(): void {
    super.destroy();

    // Clean up documents this instance was tracking
    for (const [root, registration] of styleSheetRegistry.entries()) {
      if (registration.instances.has(this)) {
        registration.instances.delete(this);

        // If no more instances are using this document, clean it up
        if (registration.instances.size === 0) {
          registration.cleanup();
          styleSheetRegistry.delete(root);
        }
      }
    }
  }

  static configure = configurator(Feedback);
}
