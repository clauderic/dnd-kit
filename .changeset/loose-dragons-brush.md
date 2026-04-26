---
'@dnd-kit/react': patch
---

Missing .map files in files field — packages/react/package.json lists all JS/CJS/DTS files but omits the .map files. Compare with @dnd-kit/abstract which correctly includes index.js.map, index.cjs.map, etc.
