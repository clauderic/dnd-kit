export type Arguments<T> = T extends (...args: infer U) => any ? U : never;

export type ArgumentAtIndex<
  Func,
  Index extends keyof Arguments<Func>
> = Arguments<Func>[Index];

export type FirstArgument<T> = ArgumentAtIndex<T, 0>;

export type Without<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
