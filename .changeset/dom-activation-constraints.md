---
'@dnd-kit/dom': minor
---

- Refactor `PointerSensor` to use the new activation primitives.
- Add `PointerActivationConstraints` with composable constraints:
  - `PointerActivationConstraints.Delay({value, tolerance})`
  - `PointerActivationConstraints.Distance({value, tolerance?})`
- Update `PointerSensor.defaults.activationConstraints(...)`:
  - Mouse on handle: activates immediately.
  - Touch: Delay 250ms with 5px tolerance.
  - Text inputs: Delay 200ms with 0px tolerance.
  - Other pointer types: Delay 200ms with 10px tolerance + Distance 5px.
- New utilities:
  - `getDocuments()` returns all same-origin documents (enables listening across iframes).
  - `getEventCoordinates(event)` returns `{x, y}` from a `PointerEvent`.
- `PointerSensor` now binds listeners across same-origin documents and improves default prevention during drag.
- Internal cleanups: remove internal `sensors/pointer/index.ts` and `utilities/execution-context/index.ts` (no public API impact).

These changes are additive and should be non-breaking. If you were composing pointer activation constraints, migrate to the new `PointerActivationConstraints` classes if you were importing internal implementations.
