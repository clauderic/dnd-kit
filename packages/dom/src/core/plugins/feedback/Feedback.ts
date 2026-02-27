import {effects, reactive, untracked} from '@dnd-kit/state';
import {configurator, Plugin} from '@dnd-kit/abstract';
import {
  DOMRectangle,
  getComputedStyles,
  getFixedPositionOffset,
  getFrameTransform,
  getRoot,
  getWindow,
  isHTMLElement,
  prefersReducedMotion,
  isKeyboardEvent,
  parseTransform,
  parseTranslate,
  showPopover,
  Styles,
  supportsPopover,
} from '@dnd-kit/dom/utilities';
import {Coordinates, Point, Rectangle} from '@dnd-kit/geometry';

import type {DragDropManager} from '../../manager/index.ts';
import type {Draggable} from '../../entities/index.ts';
import {StyleInjector} from '../stylesheet/StyleInjector.ts';

import {ATTRIBUTE, CSS_PREFIX, CSS_RULES} from './constants.ts';
import {
  createPlaceholder,
  isSameFrame,
  isTableRow,
  preventPopoverClose,
} from './utilities.ts';
import {
  createElementMutationObserver,
  createDocumentMutationObserver,
  createResizeObserver,
} from './observers.ts';
import {runDropAnimation, type DropAnimation} from './dropAnimation.ts';

export type FeedbackType = 'default' | 'move' | 'clone' | 'none';

export interface KeyboardTransition {
  duration?: number;
  easing?: string;
}

export interface FeedbackOptions {
  feedback?: FeedbackType;
  rootElement?: Element | ((source: Draggable) => Element);
  dropAnimation?: DropAnimation | null;
  keyboardTransition?: KeyboardTransition | null;
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

  /**
   * Override the drop animation configuration for this Feedback instance.
   *
   * - `undefined` – use the default from plugin options
   * - `null` – disable the drop animation entirely
   * - `DropAnimationOptions` – customize duration / easing
   * - `DropAnimationFunction` – provide a fully custom animation
   */
  public dropAnimation: DropAnimation | null | undefined;

  private state: State = {
    initial: {},
    current: {},
  };

  constructor(manager: DragDropManager, options?: FeedbackOptions) {
    super(manager, options);

    const styleInjector = manager.registry.plugins.get(
      StyleInjector as any
    ) as StyleInjector | undefined;

    const unregisterStyles = styleInjector?.register(CSS_RULES);

    if (unregisterStyles) {
      const originalDestroy = this.destroy.bind(this);
      this.destroy = () => {
        unregisterStyles();
        originalDestroy();
      };
    }

    this.registerEffect(this.#trackOverlayRoot.bind(this, styleInjector));
    this.registerEffect(this.#render);
  }

  #trackOverlayRoot(styleInjector: StyleInjector | undefined) {
    const {overlay} = this;

    if (!overlay || !styleInjector) return;

    const root = getRoot(overlay);

    if (!root) return;

    return styleInjector.addRoot(root);
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

    const {element} = source;
    const entityOptions = source.pluginConfig(Feedback);
    const feedback =
      entityOptions?.feedback ?? options?.feedback ?? 'default';

    if (
      !element ||
      feedback === 'none' ||
      !status.initialized ||
      status.initializing
    ) {
      return;
    }

    /* ---- Geometry computation ---- */

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

    const styles = new Styles(feedbackElement);
    const elementStyles = getComputedStyles(element);
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
    } = elementStyles;
    // Filter out transform-related transitions that would interfere with
    // Feedback-managed properties (--dnd-transform, --dnd-translate, --dnd-scale)
    const feedbackTransition = transition
      .split(',')
      .filter((t) => !/^\s*(transform|translate|scale)\b/.test(t))
      .join(',');
    const parsedTransform = parseTransform(elementStyles);
    // Eagerly capture the raw transform CSS value before the
    // data-dnd-dragging attribute is set, since elementStyles is a live
    // CSSStyleDeclaration and the CSS rule for [data-dnd-dragging] overrides
    // transform via !important, which would cause the live object to return
    // the overridden value instead of the original.
    const initialTransformStyle = elementStyles.transform;
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

    if (!initial.translate) {
      if (this.overlay && parsedTransform) {
        // When using an overlay, capture the full translation from both
        // the CSS `translate` and `transform` properties, since the overlay
        // element does not inherit the source element's `transform` property.
        // This is needed for libraries like react-window v2 that use CSS
        // `transform: translateY()` for positioning.
        initial.translate = {x: parsedTransform.x, y: parsedTransform.y};
      } else if (translate !== 'none') {
        const parsedTranslate = parseTranslate(translate);

        if (parsedTranslate) {
          initial.translate = parsedTranslate;
        }
      }
    }

    if (!initial.transformOrigin) {
      const current = untracked(() => position.current);

      // Use the visual position (including transforms) since the cursor
      // position is in screen coordinates. The shape's top/left have transforms
      // stripped (ignoreTransforms), so we add them back for this calculation.
      const visualLeft = left + (parsedTransform?.x ?? 0);
      const visualTop = top + (parsedTransform?.y ?? 0);

      initial.transformOrigin = {
        x:
          (current.x - visualLeft * frameTransform.scaleX - frameTransform.x) /
          (width * frameTransform.scaleX),
        y:
          (current.y - visualTop * frameTransform.scaleY - frameTransform.y) /
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

      // Compensate for transformOrigin when scaling
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

    /* ---- Apply initial feedback styles ---- */

    feedbackElement.setAttribute(ATTRIBUTE, 'true');

    const transform = untracked(() => dragOperation.transform);
    const initialTranslate = initial.translate ?? {x: 0, y: 0};
    const tX = transform.x * frameTransform.scaleX + initialTranslate.x;
    const tY = transform.y * frameTransform.scaleY + initialTranslate.y;

    const fixedOffset = getFixedPositionOffset();

    styles.set(
      {
        width: width - widthOffset,
        height: height - heightOffset,
        top: projected.top + fixedOffset.y,
        left: projected.left + fixedOffset.x,
        translate: `${tX}px ${tY}px 0`,
        transform: this.overlay ? 'none' : initialTransformStyle,
        transition: feedbackTransition
          ? `${feedbackTransition}, translate 0ms linear`
          : 'translate 0ms linear',
        scale: crossFrame ? `${scaleDelta.x} ${scaleDelta.y}` : '',
        'transform-origin': `${transformOrigin.x * 100}% ${transformOrigin.y * 100}%`,
      },
      CSS_PREFIX
    );

    /* ---- Placeholder setup ---- */

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

    /* ---- Popover promotion ---- */

    if (supportsPopover(feedbackElement)) {
      if (!feedbackElement.hasAttribute('popover')) {
        feedbackElement.setAttribute('popover', 'manual');
      }
      showPopover(feedbackElement);
      feedbackElement.addEventListener('beforetoggle', preventPopoverClose);
    }

    /* ---- Observers ---- */

    let elementMutationObserver: MutationObserver | undefined;
    let documentMutationObserver: MutationObserver | undefined;
    let savedCellWidths: string[] | undefined;

    const resizeObserver = createResizeObserver({
      placeholder: placeholder!,
      element,
      feedbackElement,
      frameTransform,
      transformOrigin,
      width,
      height,
      top,
      left,
      widthOffset,
      heightOffset,
      delta,
      styles,
      dragOperation,
      getTranslate: () => state.current.translate,
      getElementMutationObserver: () => elementMutationObserver,
      getSavedCellWidths: () => savedCellWidths,
      setSavedCellWidths: (widths) => {
        savedCellWidths = widths;
      },
    });

    const initialShape = new DOMRectangle(feedbackElement);
    untracked(() => (dragOperation.shape = initialShape));

    const feedbackWindow = getWindow(feedbackElement);
    const handleWindowResize = (event: Event) => {
      this.manager.actions.stop({event});
    };

    const reducedMotion = prefersReducedMotion(feedbackWindow);

    if (isKeyboardOperation) {
      feedbackWindow.addEventListener('resize', handleWindowResize);
    }

    if (untracked(() => source.status) === 'idle') {
      requestAnimationFrame(() => (source.status = 'dragging'));
    }

    if (placeholder) {
      resizeObserver.observe(placeholder);

      elementMutationObserver = createElementMutationObserver(
        element,
        placeholder,
        clone
      );
      documentMutationObserver = createDocumentMutationObserver(
        element,
        placeholder,
        feedbackElement
      );
    }

    /* ---- Cleanup ---- */

    const id = manager.dragOperation.source?.id;

    const restoreFocus = () => {
      if (!isKeyboardOperation || id == null) return;

      const draggable = manager.registry.draggables.get(id);
      const focusTarget = draggable?.handle ?? draggable?.element;

      if (isHTMLElement(focusTarget)) {
        focusTarget.focus();
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

      if (savedCellWidths && isTableRow(element)) {
        const cells = Array.from(element.cells);

        for (const [index, cell] of cells.entries()) {
          cell.style.width = savedCellWidths[index] ?? '';
        }
      }

      source.status = 'idle';

      const moved = state.current.translate != null;
      const isDragging = dragOperation.status.dragging;

      if (
        placeholder &&
        ((!isDragging && moved) ||
          placeholder.parentElement !== feedbackElement.parentElement) &&
        feedbackElement.isConnected
      ) {
        placeholder.replaceWith(feedbackElement);
      }

      placeholder?.remove();
    };

    /* ---- Reactive effects ---- */

    const optionsDropAnimation = options?.dropAnimation;
    const feedbackPlugin = this;

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
          const keyboardTransition = options?.keyboardTransition;
          const translateTransition =
            isKeyboardOperation &&
            !reducedMotion &&
            keyboardTransition !== null
              ? `${keyboardTransition?.duration ?? 250}ms ${keyboardTransition?.easing ?? 'cubic-bezier(0.25, 1, 0.5, 1)'}`
              : '0ms linear';

          styles.set(
            {
              transition: feedbackTransition
                ? `${feedbackTransition}, translate ${translateTransition}`
                : `translate ${translateTransition}`,
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
          this.dispose();

          source.status = 'dropping';

          const dropAnimationConfig =
            entityOptions?.dropAnimation !== undefined
              ? entityOptions.dropAnimation
              : feedbackPlugin.dropAnimation !== undefined
                ? feedbackPlugin.dropAnimation
                : optionsDropAnimation;

          let translate = state.current.translate;
          const moved = translate != null;

          if (!translate && element !== feedbackElement) {
            translate = {x: 0, y: 0};
          }

          if (!translate || dropAnimationConfig === null) {
            cleanup();
            return;
          }

          manager.renderer.rendering.then(() => {
            runDropAnimation({
              source,
              element,
              feedbackElement,
              placeholder,
              translate: translate!,
              moved,
              transition,
              alignment: source.alignment,
              styles,
              animation: dropAnimationConfig ?? undefined,
              getElementMutationObserver: () => elementMutationObserver,
              cleanup,
              restoreFocus,
            });
          });
        }
      }
    );

    return () => {
      cleanup();
      cleanupEffects();
    };
  }

  static configure = configurator(Feedback);
}
