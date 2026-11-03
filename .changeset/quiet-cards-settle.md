---
'@dnd-kit/dom': patch
---

Clean up the feedback placeholder immediately when a drop handler removes the animated element, preventing replacement content from shifting during the default drop animation. Keyboard drops can restore focus to a briefly detached or remounted target within the configured drop-animation window; pending restoration is canceled by user interaction, a new drag, or plugin teardown.
