import type {AnyFunction} from '@dnd-kit/types';

export type Events = Record<string, {} | undefined>;

export class Monitor<T extends Events> {
  private registry = new Map<keyof T, Set<AnyFunction>>();

  public addEventListener(name: keyof T, handler: AnyFunction) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.add(handler);
    registry.set(name, listeners);
  }

  public removeEventListener(name: keyof T, handler: AnyFunction) {
    const {registry} = this;
    const listeners = new Set(registry.get(name));

    listeners.delete(handler);
    registry.set(name, listeners);
  }

  public dispatch<U extends keyof T>(name: U, event?: T[U]) {
    const {registry} = this;
    const listeners = registry.get(name);

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener(event);
    }
  }
}
