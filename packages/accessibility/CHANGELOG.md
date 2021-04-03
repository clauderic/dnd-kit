# @dnd-kit/accessibility

## 2.0.0

### Major Changes

- [`2833337`](https://github.com/clauderic/dnd-kit/commit/2833337043719853902c3989dfcd5b55ae9ddc73) [#186](https://github.com/clauderic/dnd-kit/pull/186) Thanks [@clauderic](https://github.com/clauderic)! - Simplify `useAnnouncement` hook to only return a single `announcement` rather than `entries`. Similarly, the `LiveRegion` component now only accepts a single `announcement` rather than `entries.

  - The current strategy used in the useAnnouncement hook is needlessly complex. It's not actually necessary to render multiple announcements at once within the LiveRegion component. It's sufficient to render a single announcement at a time. It's also un-necessary to clean up the announcements after they have been announced, especially now that the role="status" attribute has been added to LiveRegion, keeping the last announcement rendered means users can refer to the last status.

### Patch Changes

- [`c24bdb3`](https://github.com/clauderic/dnd-kit/commit/c24bdb3723f1e3e4c474439f837a19c6d48059fb) [#184](https://github.com/clauderic/dnd-kit/pull/184) Thanks [@clauderic](https://github.com/clauderic)! - Tweaked LiveRegion component:
  - Entries are now rendered without wrapper `span` elements. Having wrapper `span` elements causes VoiceOver on macOS to try to move the VoiceOver cursor to the live region, which interferes with scrolling. This issue is not exhibited when rendering announcement entries as plain text without wrapper spans.
  - Added the `role="status"` attribute to the LiveRegion wrapper element.
  - Added the `white-space: no-wrap;` property to ensure that text does not wrap.

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

## 1.0.1

### Patch Changes

- [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a) [#37](https://github.com/clauderic/dnd-kit/pull/37) Thanks [@nickpresta](https://github.com/nickpresta)! - Fix typo in package.json repository URL

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).
