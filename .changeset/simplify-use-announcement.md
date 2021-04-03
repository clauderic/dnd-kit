---
"@dnd-kit/accessibility": major
"@dnd-kit/core": patch
---

Simplify `useAnnouncement` hook to only return a single `announcement` rather than `entries`. Similarly, the `LiveRegion` component now only accepts a single `announcement` rather than `entries.

- The current strategy used in the useAnnouncement hook is needlessly complex. It's not actually necessary to render multiple announcements at once within the LiveRegion component. It's sufficient to render a single announcement at a time. It's also un-necessary to clean up the announcements after they have been announced, especially now that the role="status" attribute has been added to LiveRegion, keeping the last announcement rendered means users can refer to the last status.
