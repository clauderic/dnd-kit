---
"@dnd-kit/accessibility": patch
---

Tweaked LiveRegion component: 
- Entries are now rendered without wrapper `span` elements. Having wrapper `span` elements causes VoiceOver on macOS to try to move the VoiceOver cursor to the live region, which interferes with scrolling. This issue is not exhibited when rendering announcement entries as plain text without wrapper spans.
- Added the `role="status"` attribute to the LiveRegion wrapper element. 
- Added the `white-space: no-wrap;` property to ensure that text does not wrap.
