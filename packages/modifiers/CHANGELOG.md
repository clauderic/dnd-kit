# @dnd-kit/modifiers

## 7.0.0

### Patch Changes

- Updated dependencies [[`bc588c7`](https://github.com/clauderic/dnd-kit/commit/bc588c7f7b1124514b2834e14f9dad29ce49c8ce), [`b417f0f`](https://github.com/clauderic/dnd-kit/commit/b417f0f94bfd8097bdf34eec27b7051dc0f5aa2a), [`f342d5e`](https://github.com/clauderic/dnd-kit/commit/f342d5efd98507f173b6a170b35bee1545d40311)]:
  - @dnd-kit/core@6.1.0
  - @dnd-kit/utilities@3.2.2

## 6.0.1

### Patch Changes

- [#823](https://github.com/clauderic/dnd-kit/pull/823) [`b065c37`](https://github.com/clauderic/dnd-kit/commit/b065c3750078bee43caa5a79f54196d4612d2375) Thanks [@DaniGuardiola](https://github.com/DaniGuardiola)! - Add missing peer dependency to @dnd-kit/modifiers

- Updated dependencies [[`da7c60d`](https://github.com/clauderic/dnd-kit/commit/da7c60dcbb76d89cf1fcb421e69a4abcea2eeebe)]:
  - @dnd-kit/core@6.0.6
  - @dnd-kit/utilities@3.2.1

## 6.0.0

### Patch Changes

- Updated dependencies [[`4173087`](https://github.com/clauderic/dnd-kit/commit/417308704454c50f88ab305ab450a99bde5034b0), [`59ca82b`](https://github.com/clauderic/dnd-kit/commit/59ca82b9f228f34c7731ece87aef5d9633608b57), [`7161f70`](https://github.com/clauderic/dnd-kit/commit/7161f702c9fe06f8dafa6449d48b918070ca46fb), [`a52fba1`](https://github.com/clauderic/dnd-kit/commit/a52fba1ccff8a8f40e2cb8dcc15236cfd9e8fbec), [`40707ce`](https://github.com/clauderic/dnd-kit/commit/40707ce6f388957203d6df4ccbeef460450ffd7d), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`bf30718`](https://github.com/clauderic/dnd-kit/commit/bf30718bc22584a47053c14f5920e317ac45cd50), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`a41e5b8`](https://github.com/clauderic/dnd-kit/commit/a41e5b8eff84f0528ffc8b3455b94b95ab60a4a9), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`77e3d44`](https://github.com/clauderic/dnd-kit/commit/77e3d44502383d2f9a9f9af014b053619b3e37b3), [`5811986`](https://github.com/clauderic/dnd-kit/commit/5811986e7544a5e80039870a015e38df805eaad1), [`e302bd4`](https://github.com/clauderic/dnd-kit/commit/e302bd4488bdfb6735c97ac42c1f4a0b1e8bfdf9), [`188a450`](https://github.com/clauderic/dnd-kit/commit/188a4507b99d8e8fdaa50bd26deb826c86608e18), [`59ca82b`](https://github.com/clauderic/dnd-kit/commit/59ca82b9f228f34c7731ece87aef5d9633608b57), [`750d726`](https://github.com/clauderic/dnd-kit/commit/750d72655922363b2218d7b41e028f9dceaef013), [`5f3c700`](https://github.com/clauderic/dnd-kit/commit/5f3c7009698d15936fd20f30f11ad3b23cd7886f), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`e6e242c`](https://github.com/clauderic/dnd-kit/commit/e6e242cbc718ed687a26f5c622eeed4dbd6c2425), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc), [`33e6dd2`](https://github.com/clauderic/dnd-kit/commit/33e6dd2dc954f1f2da90d8f8af995021031b6b41), [`10f6836`](https://github.com/clauderic/dnd-kit/commit/10f683631103b1d919f2fbca1177141b9369d2cf), [`c1b3b5a`](https://github.com/clauderic/dnd-kit/commit/c1b3b5a0be5759b707e22c4e1b1236aaa82773a2), [`035021a`](https://github.com/clauderic/dnd-kit/commit/035021aac51161e2bf9715f087a6dd1b46647bfc)]:
  - @dnd-kit/core@6.0.0
  - @dnd-kit/utilities@3.2.0

## 5.0.0

### Minor Changes

- [#567](https://github.com/clauderic/dnd-kit/pull/567) [`cd3adf3`](https://github.com/clauderic/dnd-kit/commit/cd3adf34f6d3336c539a34e203177322614623ec) Thanks [@clauderic](https://github.com/clauderic)! - Update modifiers to use `draggingNodeRect` instead of `activeNodeRect`. Modifiers should be based on the rect of the node being dragged, whether it is the draggable node or drag overlay node.

- [#518](https://github.com/clauderic/dnd-kit/pull/518) [`6310227`](https://github.com/clauderic/dnd-kit/commit/63102272d0d63dae349e2e9f638277e16a7d5970) Thanks [@clauderic](https://github.com/clauderic)! - Major internal refactor of measuring and collision detection.

  ### Summary of changes

  Previously, all collision detection algorithms were relative to the top and left points of the document. While this approach worked in most situations, it broke down in a number of different use-cases, such as fixed position droppable containers and trying to drag between containers that had different scroll positions.

  This new approach changes the frame of comparison to be relative to the viewport. This is a major breaking change, and will need to be released under a new major version bump.

  ### Breaking changes:

  - By default, `@dnd-kit` now ignores only the transforms applied to the draggable / droppable node itself, but considers all the transforms applied to its ancestors. This should provide the right balance of flexibility for most consumers.
    - Transforms applied to the droppable and draggable nodes are ignored by default, because the recommended approach for moving items on the screen is to use the transform property, which can interfere with the calculation of collisions.
    - Consumers can choose an alternate approach that does consider transforms for specific use-cases if needed by configuring the measuring prop of <DndContext>. Refer to the <Switch> example.
  - Reduced the number of concepts related to measuring from `ViewRect`, `LayoutRect` to just a single concept of `ClientRect`.
    - The `ClientRect` interface no longer holds the `offsetTop` and `offsetLeft` properties. For most use-cases, you can replace `offsetTop` with `top` and `offsetLeft` with `left`.
    - Replaced the following exports from the `@dnd-kit/core` package with `getClientRect`:
      - `getBoundingClientRect`
      - `getViewRect`
      - `getLayoutRect`
      - `getViewportLayoutRect`
  - Removed `translatedRect` from the `SensorContext` interface. Replace usage with `collisionRect`.
  - Removed `activeNodeClientRect` on the `DndContext` interface. Replace with `activeNodeRect`.

### Patch Changes

- Updated dependencies [[`f3ad20d`](https://github.com/clauderic/dnd-kit/commit/f3ad20d5b2c2f2ca7b82c193c9af5eef38c5ce11), [`02edd26`](https://github.com/clauderic/dnd-kit/commit/02edd2691b24bb49f2e7c9f9a3f282031bf658b7), [`c6c67cb`](https://github.com/clauderic/dnd-kit/commit/c6c67cb9cbc6e61027f7bb084fd2232160037d5e), [`6310227`](https://github.com/clauderic/dnd-kit/commit/63102272d0d63dae349e2e9f638277e16a7d5970), [`e7ac3d4`](https://github.com/clauderic/dnd-kit/commit/e7ac3d45699dcc7b47191a67044a516929ac439c), [`528c67e`](https://github.com/clauderic/dnd-kit/commit/528c67e4c617dfc0ce5221496aa8b222ffc82ddb), [`02edd26`](https://github.com/clauderic/dnd-kit/commit/02edd2691b24bb49f2e7c9f9a3f282031bf658b7)]:
  - @dnd-kit/core@5.0.0
  - @dnd-kit/utilities@3.1.0

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
