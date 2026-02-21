---
'@dnd-kit/react': patch
---

Fix `useDeepSignal` calling `flushSync` from within a React lifecycle method.

When signal updates are triggered synchronously from a React effect (e.g. during a `useEffect` batch), calling `flushSync` directly violates React's internal invariant. The synchronous re-render is now deferred to a microtask via `queueMicrotask`, which runs after the current React batch completes but before the next paint.
