---
'@dnd-kit/abstract': patch
'@dnd-kit/dom': patch
'@dnd-kit/react': patch
---

Refactor the drag operation system to improve code organization and maintainability:

- Split `dragOperation.ts` into multiple focused files:
  - `operation.ts` - Core drag operation logic
  - `status.ts` - Status management
  - `actions.ts` - Drag actions
- Update imports and exports to reflect new file structure
- Improve type definitions and exports
