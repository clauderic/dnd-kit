---
'@dnd-kit/abstract': patch
---

Added the `registerEffect` method that can be invoked by sub-classes that extend the base `Plugin` class to register effects and automatically dispose of them when the plugin instance is destroyed.
