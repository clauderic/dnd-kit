import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
} from '@dnd-kit/utilities';

import {Listeners} from '../utilities';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates} from '../../types';

import {CoordinatesGetter, KeyboardCode, KeyboardCodes} from './types';
import {defaultKeyboardCodes, defaultCoordinatesGetter} from './defaults';
import {
  defaultCoordinates,
  getElementCoordinates,
  getOwnerDocument,
  getScrollPosition,
} from '../../utilities';

export interface KeyboardSensorOptions extends SensorOptions {
  keyboardCodes?: KeyboardCodes;
  getNextCoordinates?: CoordinatesGetter;
  scrollBehavior?: ScrollBehavior;
}

export type KeyboardSensorProps = SensorProps<KeyboardSensorOptions>;

export class KeyboardSensor implements SensorInstance {
  public autoScrollEnabled = false;
  private coordinates: Coordinates = defaultCoordinates;
  private listeners: Listeners;

  constructor(private props: KeyboardSensorProps) {
    const {
      event: {target},
    } = props;

    this.props = props;
    this.listeners = new Listeners(getOwnerDocument(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.attach();
  }

  private attach() {
    this.handleStart();

    setTimeout(() => this.listeners.add('keydown', this.handleKeyDown));
  }

  private handleStart() {
    const {active, onStart} = this.props;
    const activeRect = getElementCoordinates(active.node.current);
    const coordinates = {
      x: activeRect.left,
      y: activeRect.top,
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
        getNextCoordinates = defaultCoordinatesGetter,
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

      const newCoordinates = getNextCoordinates(event, {
        active,
        context: context.current,
        currentCoordinates: coordinates,
      });

      if (newCoordinates) {
        const scrollDelta = {
          x: 0,
          y: 0,
        };
        const {scrollingContainer} = context.current;

        if (scrollingContainer) {
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
            scrollElementRect,
            maxScroll,
            minScroll,
          } = getScrollPosition(scrollingContainer);

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
                scrollingContainer.scrollLeft + coordinatesDelta.x <=
                  maxScroll.x) ||
              (direction === KeyboardCode.Left &&
                scrollingContainer.scrollLeft + coordinatesDelta.x >=
                  minScroll.x);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollingContainer.scrollBy({
                left: coordinatesDelta.x,
                behavior: scrollBehavior,
              });
              return;
            }

            scrollDelta.x = scrollingContainer.scrollLeft;
            scrollingContainer.scrollTo({
              left:
                direction === KeyboardCode.Right ? maxScroll.x : minScroll.x,
              behavior: scrollBehavior,
            });
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const canFullyScrollToNewCoordinates =
              (direction === KeyboardCode.Down &&
                scrollingContainer.scrollTop + coordinatesDelta.y <=
                  maxScroll.y) ||
              (direction === KeyboardCode.Up &&
                scrollingContainer.scrollTop + coordinatesDelta.y >=
                  minScroll.y);

            if (canFullyScrollToNewCoordinates) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollingContainer.scrollBy({
                top: coordinatesDelta.y,
                behavior: scrollBehavior,
              });
              return;
            }

            scrollDelta.y =
              direction === KeyboardCode.Down
                ? scrollingContainer.scrollTop - maxScroll.y
                : scrollingContainer.scrollTop - minScroll.y;

            scrollingContainer.scrollBy({
              top: -scrollDelta.y,
              behavior: scrollBehavior,
            });
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
  }

  static activators = [
    {
      eventName: 'onKeyDown' as const,
      handler: (
        event: React.KeyboardEvent,
        {keyboardCodes = defaultKeyboardCodes}: KeyboardSensorOptions
      ) => {
        const {code} = event.nativeEvent;

        if (keyboardCodes.start.includes(code)) {
          event.preventDefault();

          return true;
        }

        return false;
      },
    },
  ];
}
