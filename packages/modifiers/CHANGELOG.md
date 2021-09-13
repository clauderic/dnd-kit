# @dnd-kit/modifiers

## 4.0.0

### Minor Changes

- [#334](https://github.com/clauderic/dnd-kit/pull/334) [`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366) Thanks [@trentmwillis](https://github.com/trentmwillis)! - Add `snapCenterToCursor` modifier

### Patch Changes

- [#437](https://github.com/clauderic/dnd-kit/pull/437) [`0e628bc`](https://github.com/clauderic/dnd-kit/commit/0e628bce53fb1a7223cdedd203cb07b6e62e5ec1) Thanks [@chestozo](https://github.com/chestozo)! - Added PointerEvent support to the `getEventCoordinates` method. This fixes testing the PointerSensor with Cypress (#436)

- Updated dependencies [[`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366), [`aede2cc`](https://github.com/clauderic/dnd-kit/commit/aede2cc42d488435cf65f19b63ba6bb7702b3fde), [`05d6a78`](https://github.com/clauderic/dnd-kit/commit/05d6a78a17cbaacd8dffed685dfea5a6ea3d38a8), [`a32a4c5`](https://github.com/clauderic/dnd-kit/commit/a32a4c5f6228b9f03bf460b8403a38b8c3de493f), [`f96cb5d`](https://github.com/clauderic/dnd-kit/commit/f96cb5d5e45a1000104892244201a70cbe8e6553), [`dea715c`](https://github.com/clauderic/dnd-kit/commit/dea715c342b2d998a9f1562cacb5e70c77562c92), [`dbc9601`](https://github.com/clauderic/dnd-kit/commit/dbc9601c922e1d6944a63f66ee647f203abee595), [`46ec5e4`](https://github.com/clauderic/dnd-kit/commit/46ec5e4c6e3ca9fa849666f90fef426b3c465cf0), [`7006464`](https://github.com/clauderic/dnd-kit/commit/700646468683e4820269534c6352cca93bb5a987), [`0e628bc`](https://github.com/clauderic/dnd-kit/commit/0e628bce53fb1a7223cdedd203cb07b6e62e5ec1), [`c447880`](https://github.com/clauderic/dnd-kit/commit/c447880656b6bee2915d5a5f01d3ddfbd5705fa2), [`2ba6dfe`](https://github.com/clauderic/dnd-kit/commit/2ba6dfe6b080b90b13aa8d9eb07331515a0d2faa), [`8d70540`](https://github.com/clauderic/dnd-kit/commit/8d70540771d1455c326310b438a198d2516e1d04), [`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366), [`422d083`](https://github.com/clauderic/dnd-kit/commit/422d0831173a893099ba924bf7bbc465640fc15d), [`c4b21b4`](https://github.com/clauderic/dnd-kit/commit/c4b21b4ee17cba31c10928eb227848026f54222a), [`5a41340`](https://github.com/clauderic/dnd-kit/commit/5a41340e6561c3784da2a9266e1b852ba370918c), [`a13dbb6`](https://github.com/clauderic/dnd-kit/commit/a13dbb66586edbf2998c7b251e236604255fd227), [`e2ee0dc`](https://github.com/clauderic/dnd-kit/commit/e2ee0dccb12794c419587019defddfd82ba5d297), [`1fe9b5c`](https://github.com/clauderic/dnd-kit/commit/1fe9b5c9d34237aae6ab22d54478c419d44a079a), [`1fe9b5c`](https://github.com/clauderic/dnd-kit/commit/1fe9b5c9d34237aae6ab22d54478c419d44a079a), [`1f5ca27`](https://github.com/clauderic/dnd-kit/commit/1f5ca27b17879861c2c545160c2046a747544846)]:
  - @dnd-kit/core@4.0.0
  - @dnd-kit/utilities@3.0.0

## 3.0.0

### Patch Changes

- Updated dependencies [[`d39ab11`](https://github.com/clauderic/dnd-kit/commit/d39ab1112f9be78d467b2dfe488a7ea931d93767)]:
  - @dnd-kit/core@3.1.0

## 2.1.0

### Minor Changes

- [`68960c4`](https://github.com/clauderic/dnd-kit/commit/68960c490f50962b47a57663ee0625d7704173ec) [#295](https://github.com/clauderic/dnd-kit/pull/295) Thanks [@akhmadullin](https://github.com/akhmadullin)! - `@dnd-kit/core` is now a `peerDependency` rather than a `dependency` for other `@dnd-kit` packages that depend on it, such as `@dnd-kit/sortable` and `@dnd-kit/modifiers`. This is done to avoid issues with multiple versions of `@dnd-kit/core` being installed by some package managers such as Yarn 2.

### Patch Changes

- Updated dependencies [[`ae398de`](https://github.com/clauderic/dnd-kit/commit/ae398de012aee28f5e3bec10b438153d00f65630), [`8b938ce`](https://github.com/clauderic/dnd-kit/commit/8b938ceb158c67e9fdc4616351d1a3291ac614c3)]:
  - @dnd-kit/core@3.0.4

## 2.0.0

### Major Changes

- [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103) [#174](https://github.com/clauderic/dnd-kit/pull/174) Thanks [@clauderic](https://github.com/clauderic)! - Distributed assets now only target modern browsers. [Browserlist](https://github.com/browserslist/browserslist) config:

  ```
  defaults
  last 2 version
  not IE 11
  not dead
  ```

  If you need to support older browsers, include the appropriate polyfills in your project's build process.

### Patch Changes

- Updated dependencies [[`b7355d1`](https://github.com/clauderic/dnd-kit/commit/b7355d19d9e15bb1972627bb622c2487ddec82ad), [`a9d92cf`](https://github.com/clauderic/dnd-kit/commit/a9d92cf1fa35dd957e6c5915a13dfd2af134c103), [`b406cb9`](https://github.com/clauderic/dnd-kit/commit/b406cb9251beef8677d05c45ec42bab7581a86dc)]:
  - @dnd-kit/core@3.0.0
  - @dnd-kit/utilities@2.0.0

## 1.0.5

### Patch Changes

- Updated dependencies [[`8583825`](https://github.com/clauderic/dnd-kit/commit/8583825380bc4d7c36e076be30bb5ca3fd20a26b)]:
  - @dnd-kit/core@2.0.0

## 1.0.4

### Patch Changes

- [`6a5c8a1`](https://github.com/clauderic/dnd-kit/commit/6a5c8a13bf19742efa65b20f16666f00ffaae1b1) [#154](https://github.com/clauderic/dnd-kit/pull/154) Thanks [@clauderic](https://github.com/clauderic)! - Update implementation of FirstArgument

- Updated dependencies [[`6a5c8a1`](https://github.com/clauderic/dnd-kit/commit/6a5c8a13bf19742efa65b20f16666f00ffaae1b1)]:
  - @dnd-kit/utilities@1.0.3

## 1.0.3

### Patch Changes

- [`75bebf5`](https://github.com/clauderic/dnd-kit/commit/75bebf53cf59ae5cd530bf658f11a48be6f64d7d) [#152](https://github.com/clauderic/dnd-kit/pull/152) Thanks [@clauderic](https://github.com/clauderic)! - Update dependencies of @dnd-kit/core to ^1.2.0

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

- Updated dependencies [[`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba), [`594a24e`](https://github.com/clauderic/dnd-kit/commit/594a24e61e2fb559bceab8b50a07ceeeadf86417), [`fd25eaf`](https://github.com/clauderic/dnd-kit/commit/fd25eaf7c114f73918bf83801890d970c9b56d18)]:
  - @dnd-kit/core@1.0.2
  - @dnd-kit/utilities@1.0.2

## 1.0.1

### Patch Changes

- [`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48) [#52](https://github.com/clauderic/dnd-kit/pull/52) Thanks [@clauderic](https://github.com/clauderic)! - Add repository entry to package.json files

- Updated dependencies [[`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48), [`5194696`](https://github.com/clauderic/dnd-kit/commit/5194696b4b91f26379cd3e6c11b2d66c92d32c5b), [`310bbd6`](https://github.com/clauderic/dnd-kit/commit/310bbd6370e85f8fb16cad149e6254600a5beb3a)]:
  - @dnd-kit/utilities@1.0.1
  - @dnd-kit/core@1.0.1

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

### Patch Changes

- Updated dependencies [[`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63)]:
  - @dnd-kit/core@1.0.0
  - @dnd-kit/utilities@1.0.0

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).

### Patch Changes

- Updated dependencies [[`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e)]:
  - @dnd-kit/core@0.1.0
  - @dnd-kit/utilities@0.1.0
