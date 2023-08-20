import {reactive} from '@dnd-kit/state';
import {ScrollDirection as Direction} from '@dnd-kit/dom/utilities';

const LOCKED = true;
const UNLOCKED = false;

export class ScrollLock {
  @reactive private [Direction.Forward] = LOCKED;
  @reactive private [Direction.Reverse] = LOCKED;

  public isLocked(direction?: Direction): boolean {
    if (direction === Direction.Idle) {
      return false;
    }

    if (direction == null) {
      return (
        this[Direction.Forward] === LOCKED && this[Direction.Reverse] === LOCKED
      );
    }

    return this[direction] === LOCKED;
  }

  public unlock(direction: Direction) {
    if (direction === Direction.Idle) {
      return;
    }

    this[direction] = UNLOCKED;
  }
}
