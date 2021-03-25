import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
} from '@dnd-kit/utilities';

import {Listeners} from '../utilities';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates} from '../../types';

import {KeyboardCoordinateGetter, KeyboardCode, KeyboardCodes} from './types';
import {
  defaultKeyboardCodes,
  defaultKeyboardCoordinateGetter,
} from './defaults';
import {
  defaultCoordinates,
  getBoundingClientRect,
  getOwnerDocument,
  getWindow,
  getScrollPosition,
  getScrollElementRect,
} from '../../utilities';

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

    setTimeout(() => {
      this.listeners.add('keydown', this.handleKeyDown);
      this.windowListeners.add('resize', this.handleCancel);
    });
  }

  private handleStart() {
    const {activeNode, onStart} = this.props;

    if (!activeNode.current) {
      throw new Error('Active draggable node is undefined');
    }

    const activeNodeRect = getBoundingClientRect(activeNode.current);
    const coordinates = {
      x: activeNodeRect.left,
      y: activeNodeRect.top,
    };

    this.coordinates = coordinates;

    onStart(coordinates);
  }

  private handleKeyDown(event: Event) {
    if (event instanceof KeyboardEvent) {
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
            const canFullyScrollToNewCoordinates =
              (direction === KeyboardCode.Right &&
                scrollContainer.scrollLeft + coordinatesDelta.x <=
                  maxScroll.x) ||
              (direction === KeyboardCode.Left &&
                scrollContainer.scrollLeft + coordinatesDelta.x >= minScroll.x);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollBy({
                left: coordinatesDelta.x,
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
            const canFullyScrollToNewCoordinates =
              (direction === KeyboardCode.Down &&
                scrollContainer.scrollTop + coordinatesDelta.y <=
                  maxScroll.y) ||
              (direction === KeyboardCode.Up &&
                scrollContainer.scrollTop + coordinatesDelta.y >= minScroll.y);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollBy({
                top: coordinatesDelta.y,
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
