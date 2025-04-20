---
'@dnd-kit/abstract': patch
---

Prevent starting a new drag operation while another one is active by adding a status check in the drag operation manager. This change throws an error if an attempt is made to start a drag operation while another one is in progress.
