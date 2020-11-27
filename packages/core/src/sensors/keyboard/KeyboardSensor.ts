import {
  add as getAdjustedCoordinates,
  subtract as getCoordinatesDelta,
} from '@dropshift/utilities';

import {Listeners} from '../utilities';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates} from '../../types';

import {CoordinatesGetter, KeyCode, KeyCodes} from './types';
import {defaultKeyCodes, defaultCoordinatesGetter} from './defaults';
import {getElementCoordinates, getScrollPosition} from '../../utilities';

export interface KeyboardSensorOptions extends SensorOptions {
  keyCodes?: KeyCodes;
  getNextCoordinates?: CoordinatesGetter;
  scrollBehavior?: ScrollBehavior;
}

export type KeyboardSensorProps = SensorProps<KeyboardSensorOptions>;

export class KeyboardSensor implements SensorInstance {
  public autoScrollEnabled = false;
  private initialCoordinates: Coordinates;
  private currentCoordinates: Coordinates;
  private listeners: Listeners;

  constructor(private props: KeyboardSensorProps) {
    const {event, active} = props;

    const activeRect = getElementCoordinates(active.node.current);
    const coordinates = {
      x: activeRect.left,
      y: activeRect.top,
    };

    this.props = props;
    this.listeners = new Listeners(event.target);
    this.initialCoordinates = coordinates;
    this.currentCoordinates = coordinates;
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.handleStart();
  }

  private handleStart() {
    const {initialCoordinates} = this;
    const {onStart} = this.props;

    if (initialCoordinates) {
      onStart(initialCoordinates);

      setTimeout(() => this.listeners.add('keydown', this.handleKeyDown));
    }
  }

  private handleKeyDown(event: Event) {
    if (event instanceof KeyboardEvent) {
      const {currentCoordinates} = this;
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
        currentCoordinates,
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
            currentCoordinates
          );

          const maxCoordinates =
            scrollingContainer === document.scrollingElement
              ? {
                  left: 0,
                  right: window.innerWidth,
                  width: window.innerWidth,
                  top: 0,
                  bottom: window.innerHeight,
                  height: window.innerHeight,
                }
              : scrollingContainer.getBoundingClientRect();

          const clampedCoordinates = {
            x: Math.min(
              direction === KeyCode.Right
                ? maxCoordinates.right - maxCoordinates.width / 2
                : maxCoordinates.right,
              Math.max(
                direction === KeyCode.Right
                  ? maxCoordinates.left
                  : maxCoordinates.left + maxCoordinates.width / 2,
                newCoordinates.x
              )
            ),
            y: Math.min(
              direction === KeyCode.Down
                ? maxCoordinates.bottom - maxCoordinates.height / 2
                : maxCoordinates.bottom,
              Math.max(
                direction === KeyCode.Down
                  ? maxCoordinates.top
                  : maxCoordinates.top + maxCoordinates.height / 2,
                newCoordinates.y
              )
            ),
          };

          const {isTop, isRight, isLeft, isBottom} = getScrollPosition(
            scrollingContainer
          );

          const canScrollX =
            (direction === KeyCode.Right && !isRight) ||
            (direction === KeyCode.Left && !isLeft);
          const canScrollY =
            (direction === KeyCode.Down && !isBottom) ||
            (direction === KeyCode.Up && !isTop);

          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            if (scrollingContainer.scrollLeft + coordinatesDelta.x > 0) {
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
              left: 0,
              behavior: scrollBehavior,
            });
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            if (scrollingContainer.scrollTop + coordinatesDelta.y > 0) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollingContainer.scrollBy({
                top: coordinatesDelta.y,
                behavior: scrollBehavior,
              });
              return;
            }

            scrollDelta.y = scrollingContainer.scrollTop;
            scrollingContainer.scrollTo({
              top: 0,
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
    this.currentCoordinates = coordinates;
  }

  private handleEnd(event: Event) {
    const {onEnd} = this.props;

    event.preventDefault();
    this.teardown();
    onEnd();
  }

  private handleCancel(event: Event) {
    const {onCancel} = this.props;

    event.preventDefault();
    this.teardown();
    onCancel();
  }

  private teardown() {
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
