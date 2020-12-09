import {subtract as getCoordinatesDelta} from '@dnd-kit/utilities';

import {Listeners} from '../utilities';

import {getEventCoordinates, getOwnerDocument} from '../../utilities';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates} from '../../types';
import {KeyboardCode} from '../keyboard';

interface DistanceConstraint {
  distance: number;
}

interface DelayConstraint {
  delay: number;
  tolerance: number;
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

export interface PointerSensorOptions extends SensorOptions {
  activationConstraint?: PointerActivationConstraint;
}

export type PointerSensorProps = SensorProps<PointerSensorOptions>;

export class PointerSensor implements SensorInstance {
  public autoScrollEnabled = true;
  private activated: boolean = false;
  private initialCoordinates: Coordinates;
  private timeoutId: NodeJS.Timeout | null = null;
  private listeners: Listeners;

  constructor(
    private props: PointerSensorProps,
    private events: PointerEventHandlers,
    listenerTarget: HTMLElement | Document = getOwnerDocument(
      props.event.target
    )
  ) {
    const {event} = props;

    this.props = props;
    this.events = events;
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

    this.listeners.add(events.move.name, this.handleMove, {
      passive: false,
    });
    this.listeners.add(events.end.name, this.handleEnd);
    this.listeners.add('keydown', this.handleKeydown);

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
    const combinedDelta = Math.abs(delta.x) + Math.abs(delta.y);

    if (!activated && activationConstraint) {
      // Constraint validation
      if (isDelayConstraint(activationConstraint)) {
        if (combinedDelta >= activationConstraint.tolerance) {
          return this.handleCancel();
        }

        return;
      }

      if (isDistanceConstraint(activationConstraint)) {
        if (combinedDelta >= activationConstraint.distance) {
          return this.handleStart();
        }

        return;
      }
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

  private handleKeydown(event: Event) {
    if (event instanceof KeyboardEvent && event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }
}
