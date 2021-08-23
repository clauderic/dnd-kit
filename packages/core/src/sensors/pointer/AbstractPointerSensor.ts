import {
  subtract as getCoordinatesDelta,
  getEventCoordinates,
} from '@dnd-kit/utilities';

import {
  getEventListenerTarget,
  hasExceededDistance,
  Listeners,
} from '../utilities';

import {getOwnerDocument, getWindow} from '../../utilities';
import {EventName, preventDefault, stopPropagation} from '../events';
import {KeyboardCode} from '../keyboard';
import type {SensorInstance, SensorProps, SensorOptions} from '../types';
import type {Coordinates, DistanceMeasurement} from '../../types';

interface DistanceConstraint {
  distance: DistanceMeasurement;
  tolerance?: DistanceMeasurement;
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

export interface AbstractPointerSensorOptions extends SensorOptions {
  activationConstraint?: PointerActivationConstraint;
  onActivation?({event}: {event: Event}): void;
}

export type AbstractPointerSensorProps = SensorProps<AbstractPointerSensorOptions>;

export class AbstractPointerSensor implements SensorInstance {
  public autoScrollEnabled = true;
  private activated: boolean = false;
  private initialCoordinates: Coordinates;
  private timeoutId: NodeJS.Timeout | null = null;
  private listeners: Listeners;
  private documentListeners: Listeners;
  private windowListeners: Listeners;

  constructor(
    private props: AbstractPointerSensorProps,
    private events: PointerEventHandlers,
    listenerTarget = getEventListenerTarget(props.event.target)
  ) {
    const {event} = props;
    const {target} = event;

    this.props = props;
    this.events = events;
    this.documentListeners = new Listeners(getOwnerDocument(target));
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners(getWindow(target));
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
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);

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
    this.windowListeners.removeAll();

    // Wait until the next event loop before removing document listeners
    // This is necessary because we listen for `click` events on the document
    setTimeout(this.documentListeners.removeAll);

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
      // Stop propagation of click events once activation constraints are met
      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true,
      });

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
        if (
          activationConstraint.tolerance != null &&
          hasExceededDistance(delta, activationConstraint.tolerance)
        ) {
          return this.handleCancel();
        }
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
