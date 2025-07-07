import { useEffect, useRef } from 'react';
import { createStore } from 'solid-js/store';
import { createRoot, createComponent } from 'solid-js';
import { render as solidRender } from 'solid-js/web';

// Renders a Solid component inside a React component
export function Solid({ of: SolidComponent, ...restProps }: { of: any; [key: string]: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<any>(null);
  const disposeRef = useRef<(() => void) | null>(null);

  // Only create the Solid root once, unless the component changes
  useEffect(() => {
    if (!containerRef.current) return;

    // Create a Solid store for props
    storeRef.current = storeRef.current || createStore({ ...restProps });

    // If Solid root already exists, dispose it (only if component changes)
    if (disposeRef.current) {
      disposeRef.current();
      disposeRef.current = null;
    }

    // Create the Solid root and render the component
    disposeRef.current = solidRender(
      () => createComponent(SolidComponent, storeRef.current[0]),
      containerRef.current
    );

    return () => {
      if (disposeRef.current) {
        disposeRef.current();
        disposeRef.current = null;
      }
    };
  }, [SolidComponent]); // Only re-run if the component itself changes

  // Update the store when props change
  useEffect(() => {
    if (storeRef.current) {
      storeRef.current[1]({ ...restProps });
    }
  }, [restProps, SolidComponent]);

  return <div ref={containerRef as any} />;
}