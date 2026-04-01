---
"@dnd-kit/abstract": patch
"@dnd-kit/dom": patch
"@dnd-kit/react": patch
---

fix: resolve DTS build errors with TypeScript 5.9 on Node 20

Add explicit return type annotations to avoid `[dispose]` serialization failures during declaration emit, and fix `useRef` readonly errors for React 19 type compatibility.
