export function rAFDebounce(func: Function) {
  let lastHandler: number | null = null;

  return function (...args: any[]) {
    // debounce
    if (lastHandler) {
      cancelAnimationFrame(lastHandler);
    }

    // schedule func call
    lastHandler = requestAnimationFrame(() => {
      func(...args);
      lastHandler = null;
    });
  };
}
