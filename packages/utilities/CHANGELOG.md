# @dnd-kit/utilities

## 3.0.0

### Major Changes

- [#373](https://github.com/clauderic/dnd-kit/pull/373) [`1f5ca27`](https://github.com/clauderic/dnd-kit/commit/1f5ca27b17879861c2c545160c2046a747544846) Thanks [@clauderic](https://github.com/clauderic)! - Added react to peerDependencies of @dnd-kit/utilities

### Minor Changes

- [#334](https://github.com/clauderic/dnd-kit/pull/334) [`13be602`](https://github.com/clauderic/dnd-kit/commit/13be602229c6d5723b3ae98bca7b8f45f0773366) Thanks [@trentmwillis](https://github.com/trentmwillis)! - Move `Coordinates` interface along with `getEventCoordinates`, `isMouseEvent` and `isTouchEvent` helpers to @dnd-kit/utilities

### Patch Changes

- [#437](https://github.com/clauderic/dnd-kit/pull/437) [`0e628bc`](https://github.com/clauderic/dnd-kit/commit/0e628bce53fb1a7223cdedd203cb07b6e62e5ec1) Thanks [@chestozo](https://github.com/chestozo)! - Added PointerEvent support to the `getEventCoordinates` method. This fixes testing the PointerSensor with Cypress (#436)

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

## 1.0.3

### Patch Changes

- [`6a5c8a1`](https://github.com/clauderic/dnd-kit/commit/6a5c8a13bf19742efa65b20f16666f00ffaae1b1) [#154](https://github.com/clauderic/dnd-kit/pull/154) Thanks [@clauderic](https://github.com/clauderic)! - Update implementation of FirstArgument

## 1.0.2

### Patch Changes

- [`423610c`](https://github.com/clauderic/dnd-kit/commit/423610ca48c5e5ca95545fdb5c5cfcfbd3d233ba) [#56](https://github.com/clauderic/dnd-kit/pull/56) Thanks [@clauderic](https://github.com/clauderic)! - Add MIT license to package.json and distributed files

## 1.0.1

### Patch Changes

- [`0b343c7`](https://github.com/clauderic/dnd-kit/commit/0b343c7e88a68351f8a39f643e9f26b8e046ef48) [#52](https://github.com/clauderic/dnd-kit/pull/52) Thanks [@clauderic](https://github.com/clauderic)! - Add repository entry to package.json files

## 1.0.0

### Major Changes

- [`2912350`](https://github.com/clauderic/dnd-kit/commit/2912350c5008c2b0edda3bae30b5075a852dea63) Thanks [@clauderic](https://github.com/clauderic)! - Initial public release.

## 0.1.0

### Minor Changes

- [`7bd4568`](https://github.com/clauderic/dnd-kit/commit/7bd4568e9f339552fd73a9a4c888460b11195a5e) [#30](https://github.com/clauderic/dnd-kit/pull/30) - Initial beta release, authored by [@clauderic](https://github.com/clauderic).
