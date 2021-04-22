import {subtract as getCoordinatesDelta} from '@dnd-kit/utilities';

import {
  getEventListenerTarget,
  hasExceededDistance,
  Listeners,
} from '../utilities';

import {getEventCoordinates, getOwnerDocument} from '../../utilities';
import {KeyboardCode} from '../keyboard';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates, DistanceMeasurement} from '../../types';

interface DistanceConstraint {
  distance: DistanceMeasurement;
}

interface DelayConstraint {
  delay: number;
  tolerance: DistanceMeasurement;
}

interface EventDescriptor {
  name: keyof DocumentEventMap;
  passive?: boolean;
}

export interface PointerEventHandlers {
  move: EventDescriptor;
  end: EventDescriptor;
}

export type PointerActivationConstraint = DistanceConstraint | DelayConstraint;

function isDistanceConstraint(
  constraint: PointerActivationConstraint
): constraint is DistanceConstraint {
  return Boolean(constraint && 'distance' in constraint);
}

function isDelayConstraint(
  constraint: PointerActivationConstraint
): constraint is DelayConstraint {
  return Boolean(constraint && 'delay' in constraint);
}

export interface AbstractPointerSensorOptions<T> extends SensorOptions {
  activationConstraint?: PointerActivationConstraint;
  onActivation?({event}: {event: T}): void;
  triggerFunction?({event}: {event: T}): boolean;
}

export type AbstractPointerSensorProps<T> = SensorProps<
  AbstractPointerSensorOptions<T>
>;

enum EventName {
  Keydown = 'keydown',
}

export class AbstractPointerSensor<T> implements SensorInstance {
  public autoScrollEnabled = true;
  private activated: boolean = false;
  private initialCoordinates: Coordinates;
  private timeoutId: NodeJS.Timeout | null = null;
  private listeners: Listeners;
  private ownerDocument: Document;

  constructor(
    private props: AbstractPointerSensorProps<T>,
    private events: PointerEventHandlers,
    listenerTarget = getEventListenerTarget(props.event.target)
  ) {
    const {
      event: {nativeEvent: event},
    } = props;

    this.props = props;
    this.events = events;
    this.ownerDocument = getOwnerDocument(event.target);
    this.listeners = new Listeners(listenerTarget);
    this.initialCoordinates = getEventCoordinates(event);
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.attach();
  }

  private attach() {
    const {
      events,
      props: {
        options: {activationConstraint},
      },
    } = this;

    this.listeners.add(events.move.name, this.handleMove, false);
    this.listeners.add(events.end.name, this.handleEnd);

    this.ownerDocument.addEventListener(EventName.Keydown, this.handleKeydown);

    if (activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        return;
      }

      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(
          this.handleStart,
          activationConstraint.delay
        );
        return;
      }
    }

    this.handleStart();
  }

  private detach() {
    this.listeners.removeAll();
    this.ownerDocument.removeEventListener(
      EventName.Keydown,
      this.handleKeydown
    );

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private handleStart() {
    const {initialCoordinates} = this;
    const {onStart} = this.props;

    if (initialCoordinates) {
      this.activated = true;

      onStart(initialCoordinates);
    }
  }

  private handleMove(event: Event) {
    const {activated, initialCoordinates, props} = this;
    const {
      onMove,
      options: {activationConstraint},
    } = props;

    if (!initialCoordinates) {
      return;
    }

    const coordinates = getEventCoordinates(event);
    const delta = getCoordinatesDelta(initialCoordinates, coordinates);

    if (!activated && activationConstraint) {
      // Constraint validation
      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }

        return;
      }

      if (isDistanceConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }

        return;
      }
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    onMove(coordinates);
  }

  private handleEnd() {
    const {onEnd} = this.props;

    this.detach();
    onEnd();
  }

  private handleCancel() {
    const {onCancel} = this.props;

    this.detach();
    onCancel();
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
}
