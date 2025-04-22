---
'@dnd-kit/dom': patch
---

Add option `shouldActivate` on `KeyboardSensor`. By default `KeyboardSensor` activates if the Keyboard event is triggered from the `Draggable` `element` or `handle`. `shouldActivate` let the user override this behavior.
