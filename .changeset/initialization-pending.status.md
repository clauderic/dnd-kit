---
'@dnd-kit/abstract': patch
---

Add a new `initialization-pending` status to the drag operation lifecycle. This status is set after a dragOperation is initiated but before the `beforedragstart` event fires, which allows consumers to prevent a drag operation from being initialized. This provides better control over the drag operation lifecycle and enables cancellation of drag operations before they are initialized.
