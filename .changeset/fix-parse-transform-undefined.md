---
"@dnd-kit/dom": patch
---

Fix `TypeError: Cannot read properties of undefined (reading 'split')` in `parseScale`/`parseTranslate` on browsers that do not support the individual `scale`/`translate` CSS transform properties (Chromium < 104), where `getComputedStyle` returns `undefined` instead of `'none'`.
