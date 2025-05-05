---
'@dnd-kit/dom': patch
---

Replace `innerText` with `textContent` for better performance across multiple plugins. This change improves performance since `textContent` is generally more efficient than `innerText` as it doesn't trigger layout reflows and doesn't parse HTML entities.
