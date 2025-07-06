import { createEffect, createSignal, type Accessor, type Signal } from "solid-js";

/**
 * Creates a reactive signal that updates when the initial value changes.
 * @param initialValue A function that returns the initial value of the signal.
 *
 * @returns A reactive signal that updates when the initial value changes.
 */
export const createReactiveSignal = <T = any>(initialValue: Accessor<T>): Signal<T> => {
    const [value, setValue] = createSignal<T>(initialValue());
    
    createEffect(() => {
        const newValue = initialValue();
        
        if (newValue !== value() && newValue !== undefined) {
            setValue(() => newValue);
        }
    });
    
    return [value, setValue];
};
