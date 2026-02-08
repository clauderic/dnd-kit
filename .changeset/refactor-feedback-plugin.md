---
'@dnd-kit/dom': patch
---

Refactor the Feedback plugin for improved modularity and extensibility.

**StyleSheetManager** – Introduced a new generic `CorePlugin` that manages CSS stylesheet injection into document and shadow roots. Plugins can call `register(cssRules)` to declare styles and `addRoot(root)` to track additional roots. The manager reactively injects and cleans up adopted stylesheets as the drag operation's source and target roots change. The Feedback plugin now delegates all stylesheet management to the StyleSheetManager.

**Configurable drop animation** – The `Feedback` plugin now accepts a `dropAnimation` option:

- Pass `{ duration, easing }` to customize the built-in animation timing
- Pass a function for full custom animation control (receives context, return a promise)
- Pass `null` to disable the drop animation entirely
- Omit for the default 250ms ease animation

**Extracted helpers** – Observer setup (`createElementMutationObserver`, `createDocumentMutationObserver`, `createResizeObserver`) and the drop animation logic (`runDropAnimation`) are now in dedicated modules within the feedback plugin directory.
