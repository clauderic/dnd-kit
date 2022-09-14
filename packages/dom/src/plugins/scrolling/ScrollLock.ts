import {ScrollDirection} from '@dnd-kit/dom-utilities';
import {reactive} from '@dnd-kit/state';

export class ScrollLock {
  @reactive private [ScrollDirection.Forward] = ScrollLock.Locked;
  @reactive private [ScrollDirection.Reverse] = ScrollLock.Locked;

  public isLocked(direction: ScrollDirection) {
    if (direction === ScrollDirection.Idle) {
      return;
    }

    return this[direction] === ScrollLock.Locked;
  }

  public unlock(direction: ScrollDirection) {
    if (direction === ScrollDirection.Idle) {
      return;
    }

    this[direction] = ScrollLock.Unlocked;
  }

  static Locked = true;
  static Unlocked = false;
}
