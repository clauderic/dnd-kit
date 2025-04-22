---
'@dnd-kit/state': patch
'@dnd-kit/geometry': patch
---

Add new state management features:

- Add `ValueHistory` class for tracking value changes over time
- Add `enumerable` decorator for controlling property enumeration
- Add `snapshot` utility for creating immutable copies of reactive objects
- Refactor `Position` class to extend `ValueHistory` for better state tracking
