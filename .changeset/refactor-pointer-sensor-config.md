---
'@dnd-kit/dom': patch
---

Refactor PointerSensor configuration:

- Partially configuring the pointer sensor no longer overrides other defaults. If you wish to override all defaults, you must explicitly set each option.
- Moved default pointer sensor configuration into to PointerSensor class.
- Add static `defaults` property to PointerSensor class for easier configuration and extension.
