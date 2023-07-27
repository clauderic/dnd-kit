export type Resolve<T> = T | Promise<T>;

export type AnyFunction = (...args: any[]) => any;

export type CleanupFunction = () => void;
