import { effect } from '@dnd-kit/state';
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

type SignalLike<T> = (() => T) | { value: T };

type SignalWithDispose<T> = {
    get: Accessor<T>;
    dispose: () => void;
};

export type ProxiedStore<T> = T & { dispose: () => void };

/**
 * Creates an effect that works with both Solid.js and Preact signals
 * @param fn The effect function that can access both Solid and Preact signals
 */
export function createPreactEffect(fn: () => void): void {
    createEffect(() => {
        const dispose = effect(fn);

        onCleanup(() => dispose());
    });
}

/**
 * Creates a simple signal that tracks a value without cleanup
 * @template T - The type of the signal value
 * @param read - Function to read the current value
 * @returns A signal with getter and dispose function
 */
function createSimpleSignal<T>(read: () => T): SignalWithDispose<T> {
    const [get, set] = createSignal<T>(read());

    const dispose = effect(() => {
        const value = read();

        set(() => value);
    });

    return { get, dispose };
}

/**
 * Wraps a Preact signal into a Solid.js signal.
 *
 * This function converts various Preact signal types into a Solid.js signal:
 * - Function signals (() => T)
 * - Object signals with value property ({ value: T })
 * - Direct values (T)
 *
 * The returned Solid.js signal will automatically update when the Preact signal changes,
 * and properly clean up its effect when no longer needed.
 *
 * @template T - The type of the signal value
 * @param signal - The Preact signal to wrap
 * @returns A Solid.js signal accessor function that returns the current value
 *
 * @example
 * ```ts
 * // Function signal
 * const preactSignal = signal(42); // or () => signal.value
 * const solidSignal = wrapSignal(preactSignal);
 *
 * // Object signal
 * const preactSignal = { value: 42 };
 * const solidSignal = wrapSignal(preactSignal);
 *
 * // Direct value
 * const solidSignal = wrapSignal(42);
 * ```
 */
export function wrapSignal<T>(signal: SignalLike<T>): Accessor<T> {
    const read = () => {
        if (typeof signal === 'function') {
            return signal();
        }

        if (signal && typeof signal === 'object' && 'value' in signal) {
            return signal.value;
        }

        return signal;
    };

    const { get, dispose } = createSimpleSignal(read);

    onCleanup(() => {
        dispose();
    });

    return get;
}

/**
 * Wraps an object with signal properties into a Proxy that lazily creates Solid.js signals
 * only when properties are accessed.
 *
 * @template T - The type of the object to wrap
 * @param obj - The object with signal properties to wrap
 * @returns A Proxy that lazily creates and returns Solid.js signals for each property
 *
 * @example
 * ```ts
 * const obj = {
 *   get source() { return sourceSignal.value },
 *   get target() { return targetSignal.value },
 *   get status() { return { dragging: true } }
 * };
 * const wrapped = wrapStore(obj);
 * // Returns actual values, not signals
 * const source = wrapped.source;
 * const target = wrapped.target;
 * const isDragging = wrapped.status.dragging;
 * ```
 */
export function wrapStore<T extends object>(obj: T): ProxiedStore<T> {
    const signalCache = new Map<string | symbol, SignalWithDispose<unknown>>();

    const dispose = () => {
        for (const signal of signalCache.values()) {
            signal.dispose();
        }

        signalCache.clear();
    };

    const proxy = new Proxy(obj, {
        get(target, property) {
            if (property === 'dispose') {
                return dispose;
            }
            
            // If we already have a signal for this property, return its value
            if (signalCache.has(property)) {
                return signalCache.get(property)!.get();
            }
            
            if (!(property in target)) {
                return Reflect.get(target, property);
            }

            // Create a new signal for this property
            const signal = createSimpleSignal(() => {
                const value = Reflect.get(target, property);

                // If the value is an object, wrap it recursively
                if (value && typeof value === 'object') {
                    return wrapStore(value);
                }

                return value;
            });
            
            signalCache.set(property, signal);

            // Return the signal's value
            return signal.get();
        },
    });

    return proxy as T & { dispose: () => void };
}
