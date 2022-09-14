interface Options {
  leading?: boolean;
}

const defaultOptions: Options = {
  leading: false,
};

export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  wait: number,
  {leading} = defaultOptions
) {
  let timeoutId: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (leading && timeoutId == null) {
      callback(args);
    }

    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(args);
      timeoutId = undefined;
    }, wait);
  };
}
