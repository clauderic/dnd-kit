import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
  getOwnerDocument,
  getWindow,
  isKeyboardEvent,
} from '@dnd-kit/utilities';

import type {Coordinates} from '../../types';
import {
  defaultCoordinates,
  getTransformAgnosticClientRect,
  getScrollPosition,
  getScrollElementRect,
} from '../../utilities';
import {Listeners} from '../utilities';
import {EventName} from '../events';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';

import {KeyboardCoordinateGetter, KeyboardCode, KeyboardCodes} from './types';
import {
  defaultKeyboardCodes,
  defaultKeyboardCoordinateGetter,
} from './defaults';

export interface KeyboardSensorOptions extends SensorOptions {
  keyboardCodes?: KeyboardCodes;
  coordinateGetter?: KeyboardCoordinateGetter;
  scrollBehavior?: ScrollBehavior;
  onActivation?({event}: {event: KeyboardEvent}): void;
}

export type KeyboardSensorProps = SensorProps<KeyboardSensorOptions>;

export class KeyboardSensor implements SensorInstance {
  public autoScrollEnabled = false;
  private coordinates: Coordinates = defaultCoordinates;
  private listeners: Listeners;
  private windowListeners: Listeners;

  constructor(private props: KeyboardSensorProps) {
    const {
      event: {target},
    } = props;

    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.windowListeners = new Listeners(getWindow(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);

    this.attach();
  }

  private attach() {
    this.handleStart();

    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);

    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }

  private handleStart() {
    const {activeNode, onStart} = this.props;

    if (!activeNode.node.current) {
      throw new Error('Active draggable node is undefined');
    }

    const activeNodeRect = getTransformAgnosticClientRect(
      activeNode.node.current
    );
    const coordinates = {
      x: activeNodeRect.left,
      y: activeNodeRect.top,
    };

    this.coordinates = coordinates;

    onStart(coordinates);
  }

  private handleKeyDown(event: Event) {
    if (isKeyboardEvent(event)) {
      const {coordinates} = this;
      const {active, context, options} = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = 'smooth',
      } = options;
      const {code} = event;

      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }

      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }

      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates: coordinates,
      });

      if (newCoordinates) {
        const scrollDelta = {
          x: 0,
          y: 0,
        };
        const {scrollableAncestors} = context.current;

        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const coordinatesDelta = getCoordinatesDelta(
            newCoordinates,
            coordinates
          );
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll,
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);

          const clampedCoordinates = {
            x: Math.min(
              direction === KeyboardCode.Right
                ? scrollElementRect.right - scrollElementRect.width / 2
                : scrollElementRect.right,
              Math.max(
                direction === KeyboardCode.Right
                  ? scrollElementRect.left
                  : scrollElementRect.left + scrollElementRect.width / 2,
                newCoordinates.x
              )
            ),
            y: Math.min(
              direction === KeyboardCode.Down
                ? scrollElementRect.bottom - scrollElementRect.height / 2
                : scrollElementRect.bottom,
              Math.max(
                direction === KeyboardCode.Down
                  ? scrollElementRect.top
                  : scrollElementRect.top + scrollElementRect.height / 2,
                newCoordinates.y
              )
            ),
          };

          const canScrollX =
            (direction === KeyboardCode.Right && !isRight) ||
            (direction === KeyboardCode.Left && !isLeft);
          const canScrollY =
            (direction === KeyboardCode.Down && !isBottom) ||
            (direction === KeyboardCode.Up && !isTop);

          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates =
              scrollContainer.scrollLeft + coordinatesDelta.x;
            const canFullyScrollToNewCoordinates =
              (direction === KeyboardCode.Right &&
                newScrollCoordinates <= maxScroll.x) ||
              (direction === KeyboardCode.Left &&
                newScrollCoordinates >= minScroll.x);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior,
              });
              return;
            }

            scrollDelta.x =
              direction === KeyboardCode.Right
                ? scrollContainer.scrollLeft - maxScroll.x
                : scrollContainer.scrollLeft - minScroll.x;

            scrollContainer.scrollBy({
              left: -scrollDelta.x,
              behavior: scrollBehavior,
            });
            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates =
              scrollContainer.scrollTop + coordinatesDelta.y;
            const canFullyScrollToNewCoordinates =
              (direction === KeyboardCode.Down &&
                newScrollCoordinates <= maxScroll.y) ||
              (direction === KeyboardCode.Up &&
                newScrollCoordinates >= minScroll.y);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior,
              });
              return;
            }

            scrollDelta.y =
              direction === KeyboardCode.Down
                ? scrollContainer.scrollTop - maxScroll.y
                : scrollContainer.scrollTop - minScroll.y;

            scrollContainer.scrollBy({
              top: -scrollDelta.y,
              behavior: scrollBehavior,
            });

            break;
          }
        }

        this.handleMove(
          event,
          getAdjustedCoordinates(newCoordinates, scrollDelta)
        );
      }
    }
  }

  private handleMove(event: Event, coordinates: Coordinates) {
    const {onMove} = this.props;

    event.preventDefault();
    onMove(coordinates);
    this.coordinates = coordinates;
  }

  private handleEnd(event: Event) {
    const {onEnd} = this.props;

    event.preventDefault();
    this.detach();
    onEnd();
  }

  private handleCancel(event: Event) {
    const {onCancel} = this.props;

    event.preventDefault();
    this.detach();
    onCancel();
  }

  private detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }

  static activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: (
        event: React.KeyboardEvent,
        {
          keyboardCodes = defaultKeyboardCodes,
          onActivation,
        }: KeyboardSensorOptions
      ) => {
        const {code} = event.nativeEvent;

        if (keyboardCodes.start.includes(code)) {
          event.preventDefault();

          onActivation?.({event: event.nativeEvent});

          return true;
        }

        return false;
      },
    },
  ];
}
