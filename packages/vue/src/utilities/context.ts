import type {InjectionKey} from 'vue';
import {inject, provide} from 'vue';

export function createContext<TContextValue>(componentName: string) {
  const injectionKey: InjectionKey<TContextValue | null> = Symbol(
    `${componentName}Context`
  );

  return [injectContext, provideContext] as const;

  function injectContext<
    T extends TContextValue | null | undefined = TContextValue,
  >(fallback?: T): T extends null ? TContextValue | null : TContextValue {
    const context = inject(injectionKey, fallback);
    if (context) return context;

    if (context === null) return context as any;

    throw new Error(
      `Injection \`${injectionKey.toString()}\` not found. Component must be used within \`${componentName}\``
    );
  }
  function provideContext(contextValue: TContextValue) {
    provide(injectionKey, contextValue);
    return contextValue;
  }
}
