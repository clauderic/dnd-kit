import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
} from '@dnd-kit/utilities';

import {Listeners} from '../utilities';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates} from '../../types';

import {CoordinatesGetter, KeyCode, KeyCodes} from './types';
import {defaultKeyCodes, defaultCoordinatesGetter} from './defaults';
import {
  defaultCoordinates,
  getElementCoordinates,
  getOwnerDocument,
  getScrollPosition,
} from '../../utilities';

export interface KeyboardSensorOptions extends SensorOptions {
  keyCodes?: KeyCodes;
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
        keyCodes = defaultKeyCodes,
        getNextCoordinates = defaultCoordinatesGetter,
        scrollBehavior = 'smooth',
      } = options;
      const {code} = event;

      if (keyCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }

      if (keyCodes.cancel.includes(code)) {
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
              direction === KeyCode.Right
                ? scrollElementRect.right - scrollElementRect.width / 2
                : scrollElementRect.right,
              Math.max(
                direction === KeyCode.Right
                  ? scrollElementRect.left
                  : scrollElementRect.left + scrollElementRect.width / 2,
                newCoordinates.x
              )
            ),
            y: Math.min(
              direction === KeyCode.Down
                ? scrollElementRect.bottom - scrollElementRect.height / 2
                : scrollElementRect.bottom,
              Math.max(
                direction === KeyCode.Down
                  ? scrollElementRect.top
                  : scrollElementRect.top + scrollElementRect.height / 2,
                newCoordinates.y
              )
            ),
          };

          const canScrollX =
            (direction === KeyCode.Right && !isRight) ||
            (direction === KeyCode.Left && !isLeft);
          const canScrollY =
            (direction === KeyCode.Down && !isBottom) ||
            (direction === KeyCode.Up && !isTop);

          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const canFullyScrollToNewCoordinates =
              (direction === KeyCode.Right &&
                scrollingContainer.scrollLeft + coordinatesDelta.x <=
                  maxScroll.x) ||
              (direction === KeyCode.Left &&
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
              left: direction === KeyCode.Right ? maxScroll.x : minScroll.x,
              behavior: scrollBehavior,
            });
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const canFullyScrollToNewCoordinates =
              (direction === KeyCode.Down &&
                scrollingContainer.scrollTop + coordinatesDelta.y <=
                  maxScroll.y) ||
              (direction === KeyCode.Up &&
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
              direction === KeyCode.Down
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
        {keyCodes = defaultKeyCodes}: KeyboardSensorOptions
      ) => {
        const {code} = event.nativeEvent;

        if (keyCodes.start.includes(code)) {
          event.preventDefault();

          return true;
        }

        return false;
      },
    },
  ];
}
