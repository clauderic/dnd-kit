# @dnd-kit/react

## 0.2.3

### Patch Changes

- Updated dependencies [[`f90571d`](https://github.com/clauderic/dnd-kit/commit/f90571db8b8a94d751d3eeb80d91b6cd34716f47)]:
  - @dnd-kit/dom@0.2.3
  - @dnd-kit/abstract@0.2.3
  - @dnd-kit/state@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [[`5c80bcf`](https://github.com/clauderic/dnd-kit/commit/5c80bcf8affe6accb5b70df3e372f5e864f54b4a)]:
  - @dnd-kit/dom@0.2.2
  - @dnd-kit/abstract@0.2.2
  - @dnd-kit/state@0.2.2

## 0.2.1

### Patch Changes

- Updated dependencies [[`d7f4130`](https://github.com/clauderic/dnd-kit/commit/d7f413079b028feb826ca33243927e855619c0f2)]:
  - @dnd-kit/dom@0.2.1
  - @dnd-kit/abstract@0.2.1
  - @dnd-kit/state@0.2.1

## 0.2.0

### Patch Changes

- [#1823](https://github.com/clauderic/dnd-kit/pull/1823) [`3058ede`](https://github.com/clauderic/dnd-kit/commit/3058ede91dff4e1f5ff399d5c1d04c8681c411f6) Thanks [@github-actions](https://github.com/apps/github-actions)! - Simplified instance management of `manager` to fix a bug where the `manager` returned by `useDragDropManager` was `null` on first mount.

- Updated dependencies [[`e95a9c8`](https://github.com/clauderic/dnd-kit/commit/e95a9c8f448d6b339e0b6fd37546ac7cfdf18edb), [`e95a9c8`](https://github.com/clauderic/dnd-kit/commit/e95a9c8f448d6b339e0b6fd37546ac7cfdf18edb), [`9849887`](https://github.com/clauderic/dnd-kit/commit/984988774a6ff2f19cae4a27612bbd50cfcfa574)]:
  - @dnd-kit/abstract@0.2.0
  - @dnd-kit/dom@0.2.0
  - @dnd-kit/state@0.2.0

## 0.1.21

### Patch Changes

- Updated dependencies [[`3d6219d`](https://github.com/clauderic/dnd-kit/commit/3d6219db072551945556fdac2788e738f77b92c7)]:
  - @dnd-kit/dom@0.1.21
  - @dnd-kit/abstract@0.1.21
  - @dnd-kit/state@0.1.21

## 0.1.20

### Patch Changes

- Updated dependencies [[`3ba5a90`](https://github.com/clauderic/dnd-kit/commit/3ba5a90854669e034a06146fc0268ed0de813257), [`98d4cd4`](https://github.com/clauderic/dnd-kit/commit/98d4cd4047c56589cdf21067526426717bba01c4), [`32448ff`](https://github.com/clauderic/dnd-kit/commit/32448ff11eb3e86a28fc8f6ef7a8a3761e092412)]:
  - @dnd-kit/dom@0.1.20
  - @dnd-kit/state@0.1.20
  - @dnd-kit/abstract@0.1.20

## 0.1.19

### Patch Changes

- Updated dependencies [[`cc7feac`](https://github.com/clauderic/dnd-kit/commit/cc7feacb003b95a744c81e7c75c2aa26d071971f), [`d848327`](https://github.com/clauderic/dnd-kit/commit/d848327b242c6714b36207071ad30e6b4183e865)]:
  - @dnd-kit/dom@0.1.19
  - @dnd-kit/state@0.1.19
  - @dnd-kit/abstract@0.1.19

## 0.1.18

### Patch Changes

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`e502979`](https://github.com/clauderic/dnd-kit/commit/e502979375b9211fef277b8d657d9411f84be96c) Thanks [@github-actions](https://github.com/apps/github-actions)! - Improved TypeScript generics for better type safety and flexibility

  - Enhanced `DragDropManager` to accept generic type parameters with proper constraints, allowing for more flexible type usage while maintaining type safety
  - Updated `DragDropProvider` to support custom generic types for draggable and droppable entities
  - Modified React hooks (`useDragDropManager`, `useDragDropMonitor`, `useDragOperation`) to properly infer and return the correct generic types
  - Changed from concrete `Draggable` and `Droppable` types to generic parameters constrained by `Data` type

- [#1715](https://github.com/clauderic/dnd-kit/pull/1715) [`d6b5736`](https://github.com/clauderic/dnd-kit/commit/d6b57365dce694ecbc86f9c507dab42d0c698a99) Thanks [@github-actions](https://github.com/apps/github-actions)! - **<DragOverlay>**: Added `disabled` prop to temporarily disable `<DragOverlay>` without unmounting it. The `disabled` prop accepts either a `boolean` or function that receives the `source` as input and returns a `boolean`, which can be useful to disable the `<DragOverlay>` based on the `type` or `data` of the `source`.

- [#1714](https://github.com/clauderic/dnd-kit/pull/1714) [`6a27d87`](https://github.com/clauderic/dnd-kit/commit/6a27d87402916b736f8bc1f58d9cb434d079ccef) Thanks [@clauderic](https://github.com/clauderic)! - Refactor renderer to better handle calls to `useOptimistic` to update state during transitions.

- Updated dependencies [[`e502979`](https://github.com/clauderic/dnd-kit/commit/e502979375b9211fef277b8d657d9411f84be96c), [`88942be`](https://github.com/clauderic/dnd-kit/commit/88942be007a743673644ba531fd5c6b1a501bf2e), [`9326d43`](https://github.com/clauderic/dnd-kit/commit/9326d43ba0b9b682ee377011b96d4713711571a5), [`7af261f`](https://github.com/clauderic/dnd-kit/commit/7af261f4e3214a9ebef46d26df607221306eb697), [`b9b182e`](https://github.com/clauderic/dnd-kit/commit/b9b182ef39f7aa8bfe2d331cb20c696b1e9fc15a), [`bb790c9`](https://github.com/clauderic/dnd-kit/commit/bb790c928a9955bd5c7c4312875090e16d891c23)]:
  - @dnd-kit/dom@0.1.18
  - @dnd-kit/abstract@0.1.18
  - @dnd-kit/state@0.1.18

## 0.1.17

### Patch Changes

- Updated dependencies [[`cfb94d4`](https://github.com/clauderic/dnd-kit/commit/cfb94d4fef372059cb87cf0e63bc3ab87f5c8bd8)]:
  - @dnd-kit/dom@0.1.17
  - @dnd-kit/abstract@0.1.17
  - @dnd-kit/state@0.1.17

## 0.1.16

### Patch Changes

- Updated dependencies [[`93911cc`](https://github.com/clauderic/dnd-kit/commit/93911cca237bea302a12749476d4e18b74ac0fa2), [`0f68bb6`](https://github.com/clauderic/dnd-kit/commit/0f68bb6c95b1287d5988b1d5d4e94f1462fc36a5)]:
  - @dnd-kit/dom@0.1.16
  - @dnd-kit/abstract@0.1.16
  - @dnd-kit/state@0.1.16

## 0.1.15

### Patch Changes

- Updated dependencies [[`5539a5a`](https://github.com/clauderic/dnd-kit/commit/5539a5a2991ac86b217dba3ef70fc06331bd0260)]:
  - @dnd-kit/dom@0.1.15
  - @dnd-kit/abstract@0.1.15
  - @dnd-kit/state@0.1.15

## 0.1.14

### Patch Changes

- Updated dependencies [[`4c1e05d`](https://github.com/clauderic/dnd-kit/commit/4c1e05d531a1ffbf32b27d997ebd504532b9616a), [`a97b10c`](https://github.com/clauderic/dnd-kit/commit/a97b10c9d8467c14ef678d3776ea10a2a1e6e027), [`caa3273`](https://github.com/clauderic/dnd-kit/commit/caa3273af1fcee9b4e3b5f1e80e5573c84ab69e3), [`cb47da3`](https://github.com/clauderic/dnd-kit/commit/cb47da3dad7ec617fabb6e8c3b3432a19b354812), [`f295344`](https://github.com/clauderic/dnd-kit/commit/f2953444cbdb195e169fc615454d6be3170bf2a6)]:
  - @dnd-kit/dom@0.1.14
  - @dnd-kit/abstract@0.1.14
  - @dnd-kit/state@0.1.14

## 0.1.13

### Patch Changes

- Updated dependencies [[`c46415a`](https://github.com/clauderic/dnd-kit/commit/c46415a0733f5cbba49cdbd7b6786a0d9add6800), [`382f4e2`](https://github.com/clauderic/dnd-kit/commit/382f4e2f0800a3b85487a1a7a2cefef4484bee70), [`432a0dd`](https://github.com/clauderic/dnd-kit/commit/432a0dd8c67cfdebf0194205979b7249620e73a8), [`a3496c1`](https://github.com/clauderic/dnd-kit/commit/a3496c15c2dc07cc982608b2a4afb1c61b01dbb8), [`4a22b39`](https://github.com/clauderic/dnd-kit/commit/4a22b39267f1fa8d17a62b9c29ff8728733c1478)]:
  - @dnd-kit/dom@0.1.13
  - @dnd-kit/abstract@0.1.13
  - @dnd-kit/state@0.1.13

## 0.1.12

### Patch Changes

- Updated dependencies [[`2e0e2e2`](https://github.com/clauderic/dnd-kit/commit/2e0e2e256d2043831df6a245df9f618ac4b5ecc9), [`b86867b`](https://github.com/clauderic/dnd-kit/commit/b86867b1426525729357654a62f52fe0554f7f73), [`a913f5e`](https://github.com/clauderic/dnd-kit/commit/a913f5e68435c5c0a4a073a7437f265bcc0b5d1d)]:
  - @dnd-kit/dom@0.1.12
  - @dnd-kit/abstract@0.1.12
  - @dnd-kit/state@0.1.12

## 0.1.11

### Patch Changes

- Updated dependencies [[`2370665`](https://github.com/clauderic/dnd-kit/commit/237066598f7da6cd59d78120260788593371e820)]:
  - @dnd-kit/dom@0.1.11
  - @dnd-kit/abstract@0.1.11
  - @dnd-kit/state@0.1.11

## 0.1.10

### Patch Changes

- Updated dependencies [[`a0f5c44`](https://github.com/clauderic/dnd-kit/commit/a0f5c44985b634e8044415db342354493d201f3e)]:
  - @dnd-kit/dom@0.1.10
  - @dnd-kit/abstract@0.1.10
  - @dnd-kit/state@0.1.10

## 0.1.9

### Patch Changes

- Updated dependencies [[`ffdbf52`](https://github.com/clauderic/dnd-kit/commit/ffdbf52a93cbe0c1c785feca57622d4712175a3a)]:
  - @dnd-kit/dom@0.1.9
  - @dnd-kit/abstract@0.1.9
  - @dnd-kit/state@0.1.9

## 0.1.8

### Patch Changes

- Updated dependencies [[`14dc059`](https://github.com/clauderic/dnd-kit/commit/14dc05950ad31c50240ee864431112d7f1b70da0), [`fcd9bb5`](https://github.com/clauderic/dnd-kit/commit/fcd9bb56fafc5ec23ded219bfcd7fdfa31a0caff), [`93d3c7c`](https://github.com/clauderic/dnd-kit/commit/93d3c7c8b01d640b017cf8d2cddc69cc47c74ca5), [`3c625d6`](https://github.com/clauderic/dnd-kit/commit/3c625d61fc8bdba026d445333c2d1ca1d8489294)]:
  - @dnd-kit/dom@0.1.8
  - @dnd-kit/abstract@0.1.8
  - @dnd-kit/state@0.1.8

## 0.1.7

### Patch Changes

- Updated dependencies [[`0618852`](https://github.com/clauderic/dnd-kit/commit/0618852fdeb6948e85d1330febee73e48458e740)]:
  - @dnd-kit/dom@0.1.7
  - @dnd-kit/abstract@0.1.7
  - @dnd-kit/state@0.1.7

## 0.1.6

### Patch Changes

- [#1670](https://github.com/clauderic/dnd-kit/pull/1670) [`a69c390`](https://github.com/clauderic/dnd-kit/commit/a69c390d5b00c186e97913e0fbe32760e63f98b0) Thanks [@GuillaumeSalles](https://github.com/GuillaumeSalles)! - Fix useDroppable effects when inputs are updated

- Updated dependencies [[`7ceb799`](https://github.com/clauderic/dnd-kit/commit/7ceb799c7d214bc8223ec845357a0040c28ae40e), [`299389b`](https://github.com/clauderic/dnd-kit/commit/299389befcc747fe8d79231ba32f73afae88615e), [`4f49d1b`](https://github.com/clauderic/dnd-kit/commit/4f49d1b1de317adaa05cc0b7adacbaffda4fd8c2), [`b18115f`](https://github.com/clauderic/dnd-kit/commit/b18115f4b19c45c76c827921b25e47aad16c91ce), [`ac13c92`](https://github.com/clauderic/dnd-kit/commit/ac13c9298cc8b4eb680039cf17fb10582ab8d023)]:
  - @dnd-kit/abstract@0.1.6
  - @dnd-kit/state@0.1.6
  - @dnd-kit/dom@0.1.6

## 0.1.5

### Patch Changes

- Updated dependencies [[`8fecc41`](https://github.com/clauderic/dnd-kit/commit/8fecc416fb8503fcb555563a44246cd177677b4e), [`a9c17df`](https://github.com/clauderic/dnd-kit/commit/a9c17df386697dc3236f3ba1b7e319cdf4c5a706), [`f31589a`](https://github.com/clauderic/dnd-kit/commit/f31589ae579f1ce574207d44e4016e30b82549e9), [`616db17`](https://github.com/clauderic/dnd-kit/commit/616db17cdded5974febf69718337db0604c613fc)]:
  - @dnd-kit/dom@0.1.5
  - @dnd-kit/abstract@0.1.5
  - @dnd-kit/state@0.1.5

## 0.1.4

### Patch Changes

- Updated dependencies [[`b1d798d`](https://github.com/clauderic/dnd-kit/commit/b1d798d9454bf1d4c47c4e13d11bfd092bdc668b)]:
  - @dnd-kit/dom@0.1.4
  - @dnd-kit/abstract@0.1.4
  - @dnd-kit/state@0.1.4

## 0.1.3

### Patch Changes

- Updated dependencies [[`6c9a9ea`](https://github.com/clauderic/dnd-kit/commit/6c9a9ea060095884c90c72cd5d6b73820467ec29), [`8f91d91`](https://github.com/clauderic/dnd-kit/commit/8f91d9112608d2077c3b6c8fc939aa052606148c), [`79c6519`](https://github.com/clauderic/dnd-kit/commit/79c65195483bee3909177c1b46d1c1073dd2c765), [`52c1ba3`](https://github.com/clauderic/dnd-kit/commit/52c1ba3924be32a9c856d74a3e5221fd05fd91c1), [`6c9a9ea`](https://github.com/clauderic/dnd-kit/commit/6c9a9ea060095884c90c72cd5d6b73820467ec29), [`1bef872`](https://github.com/clauderic/dnd-kit/commit/1bef8722d515079f998dc0608084e1d853e74d3a), [`9a0edf6`](https://github.com/clauderic/dnd-kit/commit/9a0edf64cbde1bd761f3650e043b6612e61a5fab), [`18a7998`](https://github.com/clauderic/dnd-kit/commit/18a7998858e6504f0e3c6f613bd174eb9f68e553), [`a9db4c7`](https://github.com/clauderic/dnd-kit/commit/a9db4c73467d9eda9f95fe5b582948c9fc735f57)]:
  - @dnd-kit/dom@0.1.3
  - @dnd-kit/state@0.1.3
  - @dnd-kit/abstract@0.1.3

## 0.1.2

### Patch Changes

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`42bec2c`](https://github.com/clauderic/dnd-kit/commit/42bec2c507adf5659d70a1d5fba33847b0efe016) Thanks [@github-actions](https://github.com/apps/github-actions)! - Add 'use client' directive to DragDropProvider component

  This change ensures proper client-side rendering in Next.js applications by explicitly marking the DragDropProvider component as a client component.

- [#1658](https://github.com/clauderic/dnd-kit/pull/1658) [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Refactor the drag operation system to improve code organization and maintainability:

  - Split `dragOperation.ts` into multiple focused files:
    - `operation.ts` - Core drag operation logic
    - `status.ts` - Status management
    - `actions.ts` - Drag actions
  - Update imports and exports to reflect new file structure
  - Improve type definitions and exports

- Updated dependencies [[`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a), [`4682570`](https://github.com/clauderic/dnd-kit/commit/4682570a6b80868af0e51b1bbbf902430117df43), [`f8d69b0`](https://github.com/clauderic/dnd-kit/commit/f8d69b01f4cf53fc368ef1fca9188c313192928d), [`d04e9a2`](https://github.com/clauderic/dnd-kit/commit/d04e9a2879fb00f092c3f8280c8081a48eebf193), [`ee55f58`](https://github.com/clauderic/dnd-kit/commit/ee55f582f92dc42cc6eea9ad7492fc782ca6455a), [`374f81f`](https://github.com/clauderic/dnd-kit/commit/374f81f84c9401729e2e0ee48520c647a48e5afd)]:
  - @dnd-kit/state@0.1.2
  - @dnd-kit/abstract@0.1.2
  - @dnd-kit/dom@0.1.2

## 0.1.1

### Patch Changes

- [#1656](https://github.com/clauderic/dnd-kit/pull/1656) [`a4f5fc3`](https://github.com/clauderic/dnd-kit/commit/a4f5fc36a3993050eb8ccf693c65f1fffbe455c5) Thanks [@github-actions](https://github.com/apps/github-actions)! - - Update `DragDropEventHandlers` types to be non nullable.
  - Export `DragDropEvents` and allow them to be generic
  - Allow `DragDropProvider` to be passed `Data` as a generic
- Updated dependencies [[`569b6e3`](https://github.com/clauderic/dnd-kit/commit/569b6e3a1d3b199328f7a2362a10b446e657726f), [`a176848`](https://github.com/clauderic/dnd-kit/commit/a1768481e3f7dc4d1176a7fcb363acd020f2c46c), [`f13cbc9`](https://github.com/clauderic/dnd-kit/commit/f13cbc978229844770d3c8aa03135e4352ee2532)]:
  - @dnd-kit/dom@0.1.1
  - @dnd-kit/abstract@0.1.1
  - @dnd-kit/state@0.1.1

## 0.1.0

### Minor Changes

- [#1650](https://github.com/clauderic/dnd-kit/pull/1650) [`23d694b`](https://github.com/clauderic/dnd-kit/commit/23d694b459d7aded0e5674d6da94652ee2f46faf) Thanks [@MateusJabour](https://github.com/MateusJabour)! - Exports sensors from `@dnd-kit/dom` through `@dnd-kit/react`

### Patch Changes

- [#1644](https://github.com/clauderic/dnd-kit/pull/1644) [`6cb931f`](https://github.com/clauderic/dnd-kit/commit/6cb931f43fc5e24e13644677c7939aca90f415fa) Thanks [@github-actions](https://github.com/apps/github-actions)! - Export `DragDropEventHandlers` type

- Updated dependencies [[`00a33c9`](https://github.com/clauderic/dnd-kit/commit/00a33c99e777ab205a45309a4efc8b3560bafdaf), [`043c280`](https://github.com/clauderic/dnd-kit/commit/043c2807a7aa290ce9838a638422245b0bd89cf1), [`ee40aac`](https://github.com/clauderic/dnd-kit/commit/ee40aacda6c015b1f357182c461650fde4c6704e), [`635d94f`](https://github.com/clauderic/dnd-kit/commit/635d94f6e719bcdf50e0024b6d1f09b9bb46c8a5), [`0235cef`](https://github.com/clauderic/dnd-kit/commit/0235cefcf4942c86189e81fde4dc8f19ad420517), [`1ba8700`](https://github.com/clauderic/dnd-kit/commit/1ba8700fd03f3fdc8f4fabe90befbc8fd54d99f5), [`3080d2c`](https://github.com/clauderic/dnd-kit/commit/3080d2c8c122beabc41fb8d79beceb2188a01947)]:
  - @dnd-kit/abstract@0.1.0
  - @dnd-kit/dom@0.1.0
  - @dnd-kit/state@0.1.0

## 0.0.10

### Patch Changes

- [#1606](https://github.com/clauderic/dnd-kit/pull/1606) [`76d2d65`](https://github.com/clauderic/dnd-kit/commit/76d2d65d6555040dc64aa8f277f531808022000e) Thanks [@github-actions](https://github.com/apps/github-actions)! - Introduce the `useDragDropMonitor` hook to the `@dnd-kit/react` package. This hook allows you to monitor drag and drop events within a `DragDropProvider`.

- [`349f0c0`](https://github.com/clauderic/dnd-kit/commit/349f0c0994cbc01f8f86372a938017362d767fe4) Thanks [@clauderic](https://github.com/clauderic)! - Fixed incorrect types for the `useDragDropMonitor` hook.

- Updated dependencies [[`2c53eb9`](https://github.com/clauderic/dnd-kit/commit/2c53eb95a980d143b179af5b7f0a071cdedd9089), [`3155941`](https://github.com/clauderic/dnd-kit/commit/3155941608dbf16ed867e931381e7bb2c65a126d), [`082836e`](https://github.com/clauderic/dnd-kit/commit/082836e517252262b7984b142093ba6c81c43ba8)]:
  - @dnd-kit/dom@0.0.10
  - @dnd-kit/abstract@0.0.10
  - @dnd-kit/state@0.0.10

## 0.0.9

### Patch Changes

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`d86bbc7`](https://github.com/clauderic/dnd-kit/commit/d86bbc7e73ba16296c48f9af29f1893624157a0f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `alignment` configuration option to draggable instances to let consumers decide how to align the draggable during the drop animation and while keyboard sorting. Defaults to the center of the target shape.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`2b76c19`](https://github.com/clauderic/dnd-kit/commit/2b76c19f7608c69b858eaa52b9b3410289ed543b) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added `style` and `tag` props to `<DragOverlay>` component.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`b8898bc`](https://github.com/clauderic/dnd-kit/commit/b8898bc7718e26aa5d023e3756085a0cd6614f9e) Thanks [@github-actions](https://github.com/apps/github-actions)! - Re-export `isSortable` from `@dnd-kit/react/sortable` so React consumers don't have to import it from `@dnd-kit/dom/sortable`.

- [#1600](https://github.com/clauderic/dnd-kit/pull/1600) [`c5f25c8`](https://github.com/clauderic/dnd-kit/commit/c5f25c8322ae8e2bdccd51f80352539b88a9e34a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Force synchronous re-render when `isDragSource` property is updated from `true` to `false` to enable seamless transition into idle state after drop animation. Without this change, the drop animation can finish before React has had a chance to update the drag source styles back to its idle state, which can cause some flickering.

- Updated dependencies [[`e36d954`](https://github.com/clauderic/dnd-kit/commit/e36d95420148659ba78bdbefd3a0a24ec5d02b8f), [`bb4abcd`](https://github.com/clauderic/dnd-kit/commit/bb4abcd1957f2562072059ad8b5e701893a0fede), [`d86bbc7`](https://github.com/clauderic/dnd-kit/commit/d86bbc7e73ba16296c48f9af29f1893624157a0f), [`f433fb2`](https://github.com/clauderic/dnd-kit/commit/f433fb21aa76c5b4badeec6423e3c930006c8d70), [`7dc0103`](https://github.com/clauderic/dnd-kit/commit/7dc0103c5e5281e9ee61bcd9c3ab493fc9307073), [`cff3c3c`](https://github.com/clauderic/dnd-kit/commit/cff3c3cbbe96a6f401cb3900a8cd5f727a974c2d), [`b7f1cf8`](https://github.com/clauderic/dnd-kit/commit/b7f1cf8f9e15a285c45f896e092f61001335cdff), [`f87d633`](https://github.com/clauderic/dnd-kit/commit/f87d63347529f5c9600bcffb14ad2d15ff6eb107), [`860759b`](https://github.com/clauderic/dnd-kit/commit/860759b15167616c465eef1738fd02c76aa53cb3), [`54e416f`](https://github.com/clauderic/dnd-kit/commit/54e416f6f0aaa19c11827f80b2df796bfe237ba0), [`3e629cc`](https://github.com/clauderic/dnd-kit/commit/3e629cc81dbaf9d112c4f1d2c10c75eb6779cf4e), [`c51778d`](https://github.com/clauderic/dnd-kit/commit/c51778dde5bcd614b1891c5f7659130769ddc9f8), [`86ed6c8`](https://github.com/clauderic/dnd-kit/commit/86ed6c8e203bb167d451c36605c2a0e0d33f0157), [`afedea9`](https://github.com/clauderic/dnd-kit/commit/afedea930bbfd1ea546c2bcbe5f42a3ea8b913fe), [`ce31da7`](https://github.com/clauderic/dnd-kit/commit/ce31da736ec5d4f48bab45430be7b57223d60ee7)]:
  - @dnd-kit/abstract@0.0.9
  - @dnd-kit/dom@0.0.9
  - @dnd-kit/state@0.0.9

## 0.0.8

### Patch Changes

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`426339d`](https://github.com/clauderic/dnd-kit/commit/426339df7bcfdfb08a2d3b9b2eb0abb8c02ed526) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added the `<DragOverlay>` component to ease migration for consumers of `@dnd-kit/core` migrating to `@dnd-kit/react`

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`3ea0d31`](https://github.com/clauderic/dnd-kit/commit/3ea0d314649b186bfe0524d50145625da13a8787) Thanks [@github-actions](https://github.com/apps/github-actions)! - Added optional `register` argument to instances of `Entity` to disable automatic registration of instances that have a manager supplied on initialization.

- [#1598](https://github.com/clauderic/dnd-kit/pull/1598) [`e7fafec`](https://github.com/clauderic/dnd-kit/commit/e7fafec99cdcd44612a905cdb6ba560d42f1d786) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent the `Feedback` element that has the popover attribute from being accidentally closed during the drag operation, which would take it out of the top layer.

- [#1597](https://github.com/clauderic/dnd-kit/pull/1597) [`6978d81`](https://github.com/clauderic/dnd-kit/commit/6978d81311e5ac0d9c623b8ceb864740c693ca1d) Thanks [@clauderic](https://github.com/clauderic)! - Introduce `useDeepSignal` hook, which keeps track of which properties are read on an object and automatically re-renders the component when a read signal changes.

- Updated dependencies [[`0de7456`](https://github.com/clauderic/dnd-kit/commit/0de7456ade17b9a0aa127b8adf13495e7fdf1558), [`c9716cf`](https://github.com/clauderic/dnd-kit/commit/c9716cf7b8b846faab451bd2f60c53c77d2d24ba), [`3ea0d31`](https://github.com/clauderic/dnd-kit/commit/3ea0d314649b186bfe0524d50145625da13a8787), [`3cf4db1`](https://github.com/clauderic/dnd-kit/commit/3cf4db126813ebe6ddfc025df5e42e9bfcfa9c38), [`74eedef`](https://github.com/clauderic/dnd-kit/commit/74eedef3441dc07d8fa8dd9337a6b2d748b0cdde), [`42e7256`](https://github.com/clauderic/dnd-kit/commit/42e7256e7fb9c11ed6295b77e30c41ebe66a15d1)]:
  - @dnd-kit/dom@0.0.8
  - @dnd-kit/abstract@0.0.8
  - @dnd-kit/state@0.0.8

## 0.0.7

### Patch Changes

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`cef9b46`](https://github.com/clauderic/dnd-kit/commit/cef9b46c5ed017e6a601b1d0ee9d0f05b7bbd19f) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix global modifiers set on `DragDropManager` / `<DragDropProvider>` being destroyed after the first drag operation.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`7c175e1`](https://github.com/clauderic/dnd-kit/commit/7c175e1694fc9c86b5882a5467f0f15fa954bd0a) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fix element refs not being synchronized properly.

- [#1592](https://github.com/clauderic/dnd-kit/pull/1592) [`280b7e2`](https://github.com/clauderic/dnd-kit/commit/280b7e229d5e6a5f067a66038e50c4fbb3b29dc0) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed stale modifiers when using `useSortable`.

- Updated dependencies [[`550a868`](https://github.com/clauderic/dnd-kit/commit/550a86870d7441a38a06b3e7c35aa0d7d89e32d1), [`c1dadef`](https://github.com/clauderic/dnd-kit/commit/c1dadef118f8f5f096d36dac314bfe317ea950ce), [`75e23b6`](https://github.com/clauderic/dnd-kit/commit/75e23b6fdfdeadeae1b9a4b2b9be7682f48c10e4), [`cef9b46`](https://github.com/clauderic/dnd-kit/commit/cef9b46c5ed017e6a601b1d0ee9d0f05b7bbd19f), [`730064b`](https://github.com/clauderic/dnd-kit/commit/730064b8b06bd25ebde335305a303fdf4c9a9c7f), [`808f184`](https://github.com/clauderic/dnd-kit/commit/808f184439125cf7e66054b3e85ac087aa04f13b), [`c4e7a7c`](https://github.com/clauderic/dnd-kit/commit/c4e7a7cd98ccaec99fa1037cb1020d3d05cea090), [`280b7e2`](https://github.com/clauderic/dnd-kit/commit/280b7e229d5e6a5f067a66038e50c4fbb3b29dc0), [`84b75fc`](https://github.com/clauderic/dnd-kit/commit/84b75fc3a7b7a555481dbeba533bc28128783e72)]:
  - @dnd-kit/dom@0.0.7
  - @dnd-kit/abstract@0.0.7
  - @dnd-kit/state@0.0.7

## 0.0.6

### Patch Changes

- [#1567](https://github.com/clauderic/dnd-kit/pull/1567) [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Add source maps to output.

- [#1554](https://github.com/clauderic/dnd-kit/pull/1554) [`7aeac23`](https://github.com/clauderic/dnd-kit/commit/7aeac233e4eae80c2c519b0ed2b90bf19e77f92f) Thanks [@chrisvxd](https://github.com/chrisvxd)! - fix: don't lockup in React strict mode when using DragDropManager with the default manager

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`d26fafe`](https://github.com/clauderic/dnd-kit/commit/d26fafe02c0d3018df03ac3ff2bbd95602ed87ed) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent un-necessary re-renders of unused `useSignal` values.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`d302511`](https://github.com/clauderic/dnd-kit/commit/d302511c96e11e30763361aa6a88d1eb6c6dc0f1) Thanks [@github-actions](https://github.com/apps/github-actions)! - Prevent unstable `ref` from being set to undefined during a drag operation on draggable sources during a drag operation.

- [#1591](https://github.com/clauderic/dnd-kit/pull/1591) [`548f011`](https://github.com/clauderic/dnd-kit/commit/548f011a6b3e91f013ef5a4559197676e218d0e9) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Address typo in React 19 peer dependency.

- [#1590](https://github.com/clauderic/dnd-kit/pull/1590) [`5e55b89`](https://github.com/clauderic/dnd-kit/commit/5e55b8952b7d95e84d554a9b0c4051fd2a05d0bd) Thanks [@chrisvxd](https://github.com/chrisvxd)! - Add React 19 to list of supported peer dependencies.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`a5a556a`](https://github.com/clauderic/dnd-kit/commit/a5a556abfeec1d78effb3e047f529555e444c020) Thanks [@github-actions](https://github.com/apps/github-actions)! - Fixed React lifecycle regressions related to StrictMode.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`e2f5d93`](https://github.com/clauderic/dnd-kit/commit/e2f5d935cd21303c9877ce46f7642de7fc9b1ae8) Thanks [@github-actions](https://github.com/apps/github-actions)! - `useSortable`: Make sure `group` and `index` are updated at the same time.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`ff17c04`](https://github.com/clauderic/dnd-kit/commit/ff17c0497ba5604648319917ff327bd52518d426) Thanks [@github-actions](https://github.com/apps/github-actions)! - Allow dependencies to be passed to `useComputed` hook.

- [#1454](https://github.com/clauderic/dnd-kit/pull/1454) [`3312dcf`](https://github.com/clauderic/dnd-kit/commit/3312dcf89428a65d134f1467597edd8bf0becc0d) Thanks [@github-actions](https://github.com/apps/github-actions)! - Use layout effect to register instances in the `useInstance` hook. This fixes issues with effects running after the browser has painted during drag operations, which can result in invalid shapes or flickering.

- Updated dependencies [[`984b5ab`](https://github.com/clauderic/dnd-kit/commit/984b5ab7bec3145dedb9c9b3b560ffbf7e54b919), [`081b7f2`](https://github.com/clauderic/dnd-kit/commit/081b7f2a11da2aad8ce3da7f0579974415d1fdf0), [`d436037`](https://github.com/clauderic/dnd-kit/commit/d43603740a4d056e9fc7501e9b2117c173b1df4d), [`94920c8`](https://github.com/clauderic/dnd-kit/commit/94920c8a7a3a15accfb806b52e4935637b1a0781), [`a04d3f8`](https://github.com/clauderic/dnd-kit/commit/a04d3f88d380853b97585ab3b608561f7b02ce69), [`0676276`](https://github.com/clauderic/dnd-kit/commit/0676276f5423dbb4e0cad738ac3784937dc7504b), [`8053e4b`](https://github.com/clauderic/dnd-kit/commit/8053e4b4a727c6097b29fb559ce72362d7d6eb2a), [`f400106`](https://github.com/clauderic/dnd-kit/commit/f400106072d12a902f6c113b889c7de97f43e1ea), [`c597b3f`](https://github.com/clauderic/dnd-kit/commit/c597b3fe1514f10e227c287dc8ad875134e9b4cb), [`a8542de`](https://github.com/clauderic/dnd-kit/commit/a8542de56d39c3cd3b6ef981172a0782454295b2), [`a9798f4`](https://github.com/clauderic/dnd-kit/commit/a9798f43450e406e8cb235b7d5fba8bb809fd1d7), [`f7458d9`](https://github.com/clauderic/dnd-kit/commit/f7458d9dc32824dbea3a6d5dfb29236f19a2c073), [`b750c05`](https://github.com/clauderic/dnd-kit/commit/b750c05b4b14f5d9817dc07d974d40b74470e904), [`e70b29a`](https://github.com/clauderic/dnd-kit/commit/e70b29ae64837e424f7279c95112fb6e420c4dcc), [`3d0b00a`](https://github.com/clauderic/dnd-kit/commit/3d0b00a663b9dc38ccd7a46544c94a342694b626), [`e6a8e01`](https://github.com/clauderic/dnd-kit/commit/e6a8e018d2d7ad9a11e5b05f07774c7e3ac08da3), [`7ef9864`](https://github.com/clauderic/dnd-kit/commit/7ef98642207c8beac1ca7e2704ce8805767dc89d), [`4d1a030`](https://github.com/clauderic/dnd-kit/commit/4d1a0306c920ae064eb5b30c4c02961f50460c84), [`51be6df`](https://github.com/clauderic/dnd-kit/commit/51be6dfe1b8cb42f74df34c76098e197b9208f81), [`fe76033`](https://github.com/clauderic/dnd-kit/commit/fe7603330fb4b0a397c0e2af641df94fc2879c35), [`62a8118`](https://github.com/clauderic/dnd-kit/commit/62a81180c84f7782b14b69b56f891c810e7d0f69), [`a5933d8`](https://github.com/clauderic/dnd-kit/commit/a5933d8607e63ed08818ffab43e858863cb35d47), [`0c7bf85`](https://github.com/clauderic/dnd-kit/commit/0c7bf85897992dc48c3cf2f1deeaa896995bfcc3), [`f219549`](https://github.com/clauderic/dnd-kit/commit/f219549087d9100cee53ab0cf35d820fe256aa85), [`bfc8ab2`](https://github.com/clauderic/dnd-kit/commit/bfc8ab21cfd9c16a8d90ab250386e6d52d0a40a3), [`a5a556a`](https://github.com/clauderic/dnd-kit/commit/a5a556abfeec1d78effb3e047f529555e444c020), [`b5edff1`](https://github.com/clauderic/dnd-kit/commit/b5edff19279c07bbcd54ebc4579817b8a36cfff5), [`96f28ef`](https://github.com/clauderic/dnd-kit/commit/96f28ef86adf95e77540732d39033c7f3fb0fd04), [`3fb972e`](https://github.com/clauderic/dnd-kit/commit/3fb972e228aabfe07d662b77c642405f909fddb0), [`5b36f8f`](https://github.com/clauderic/dnd-kit/commit/5b36f8fb36f5a4468793b469425b5c0461426f56), [`69bfad7`](https://github.com/clauderic/dnd-kit/commit/69bfad7d795947987a4281f1a61f81b6a7839fe8), [`c42a11b`](https://github.com/clauderic/dnd-kit/commit/c42a11b60e950d50f8c243bdf8df4f32e1d47d23)]:
  - @dnd-kit/abstract@0.0.6
  - @dnd-kit/dom@0.0.6
  - @dnd-kit/state@0.0.6

## 0.0.5

### Patch Changes

- Updated dependencies [[`e9be505`](https://github.com/clauderic/dnd-kit/commit/e9be5051b5c99e522fb6efd028d425220b171890)]:
  - @dnd-kit/abstract@0.0.5
  - @dnd-kit/dom@0.0.5
  - @dnd-kit/state@0.0.5

## 0.0.4

### Patch Changes

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177) Thanks [@clauderic](https://github.com/clauderic)! - Added `status` property to draggable instances to know the current status of a draggable instance. Useful to know if an instance is being dropped.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98) Thanks [@clauderic](https://github.com/clauderic)! - Refactor the lifecycle to allow `manager` to be optional and provided later during the lifecycle of `draggable` / `droppable` / `sortable` instances.

- [#1443](https://github.com/clauderic/dnd-kit/pull/1443) [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3) Thanks [@clauderic](https://github.com/clauderic)! - Removed `options` and `options.register` from `Entity` base class. Passing an `undefined` manager when instantiating `Draggable` and `Droppable` now has the same effect.

- Updated dependencies [[`2ccc27c`](https://github.com/clauderic/dnd-kit/commit/2ccc27c566b13d6de46719d0ad5978d655261177), [`1b9df29`](https://github.com/clauderic/dnd-kit/commit/1b9df29e03306c6d3fb3e8b2b321486f5c62847a), [`4dbcb1c`](https://github.com/clauderic/dnd-kit/commit/4dbcb1c87c34273fecf7257cd4cb5ac67b42d3a4), [`a4d9150`](https://github.com/clauderic/dnd-kit/commit/a4d91500124698abf58355592913f84d438faa3d), [`e0d80f5`](https://github.com/clauderic/dnd-kit/commit/e0d80f59c733b3adcf1fc89d29aa80257e7edd98), [`794cf2f`](https://github.com/clauderic/dnd-kit/commit/794cf2f4bdeeb57a197effb1df654c7c44cf34a3)]:
  - @dnd-kit/abstract@0.0.4
  - @dnd-kit/dom@0.0.4
  - @dnd-kit/state@0.0.4

## 0.0.3

### Patch Changes

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Fixed lifecycle related issues.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`86e5191`](https://github.com/clauderic/dnd-kit/commit/86e519187f0072761321e44cb11abf2f4797169e) Thanks [@clauderic](https://github.com/clauderic)! - Fixed a bug where `useDraggable`, `useDroppable` and `useSortable` would not un-register from the old manager and re-register themselves with the new manager when its reference changes.

- [`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59) Thanks [@clauderic](https://github.com/clauderic)! - Add lazy import for `DragDropProvider`.

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80) Thanks [@clauderic](https://github.com/clauderic)! - Update modifiers on the `Draggable` instances when `useDraggable` receives updated modifiers

- [#1440](https://github.com/clauderic/dnd-kit/pull/1440) [`8f421ee`](https://github.com/clauderic/dnd-kit/commit/8f421ee00201435ead41ac4c45dae72bf030b5a5) Thanks [@clauderic](https://github.com/clauderic)! - Add `"use client"` hints to `@dnd-kit/react` exports.

- Updated dependencies [[`8530c12`](https://github.com/clauderic/dnd-kit/commit/8530c122c8db7723a8c13a207a11487b3354cb59), [`8e45c2a`](https://github.com/clauderic/dnd-kit/commit/8e45c2a9d750283296b56b05a887be89fe7b0184), [`5ccd5e6`](https://github.com/clauderic/dnd-kit/commit/5ccd5e668fb8d736ec3c195116559cb5c5684e80), [`886de33`](https://github.com/clauderic/dnd-kit/commit/886de33d0df851ebdcb3fcf2915f9623069b06d1)]:
  - @dnd-kit/dom@0.0.3
  - @dnd-kit/abstract@0.0.3
  - @dnd-kit/state@0.0.3

## 0.0.2

### Patch Changes

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2) Thanks [@clauderic](https://github.com/clauderic)! - - `useDraggable`: Fixed a bug where the `element` was not properly being set on initialization

- [#1430](https://github.com/clauderic/dnd-kit/pull/1430) [`2c3ad5e`](https://github.com/clauderic/dnd-kit/commit/2c3ad5eab3aabfd0aaa5a3a299dae1e307e8edaf) Thanks [@clauderic](https://github.com/clauderic)! - - Fix issues with `<StrictMode>` in React

- Updated dependencies [[`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2), [`6c84308`](https://github.com/clauderic/dnd-kit/commit/6c84308b45c55ca1324a5c752b0ec117235da9e2), [`d273f70`](https://github.com/clauderic/dnd-kit/commit/d273f700c3f580cb781bd004ed025bbceee20c4e), [`34c6fdc`](https://github.com/clauderic/dnd-kit/commit/34c6fdc6fb20c092a9370e35f22bf55d8065130c), [`2c3ad5e`](https://github.com/clauderic/dnd-kit/commit/2c3ad5eab3aabfd0aaa5a3a299dae1e307e8edaf)]:
  - @dnd-kit/dom@0.0.2
  - @dnd-kit/state@0.0.2
  - @dnd-kit/abstract@0.0.2
