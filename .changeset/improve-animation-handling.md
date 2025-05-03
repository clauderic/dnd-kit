---
'@dnd-kit/dom': patch
---

Improve animation handling and scheduling

- Refactor Scheduler to be more flexible and generic
- Cache successive document.getAnimations() calls
- Fix bugs in Safari when projecting animations in DOMRectangle
- Fix animation handling in Feedback and Sortable components
