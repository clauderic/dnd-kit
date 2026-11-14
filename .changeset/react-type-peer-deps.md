---
'@dnd-kit/core': patch
'@dnd-kit/sortable': patch
'@dnd-kit/utilities': patch
---

Declare `@types/react` as an optional peer dependency so TypeScript can resolve the React types these packages reference when the install layout places packages outside the project.
