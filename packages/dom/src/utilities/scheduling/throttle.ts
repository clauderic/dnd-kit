import {timeout} from './timeout.ts';

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  const time = () => performance.now();
  let cancel: () => void | undefined;
  let lastRan: number;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = time();
    } else {
      cancel?.();
      cancel = timeout(
        () => {
          func.apply(context, args);
          lastRan = time();
        },
        limit - (time() - lastRan)
      );
    }
  };
}
