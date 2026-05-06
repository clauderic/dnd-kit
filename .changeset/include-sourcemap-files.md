---
'@dnd-kit/react': patch
'@dnd-kit/solid': patch
'@dnd-kit/vue': patch
---

Include sourcemap files in published packages. The build emits `.map` files alongside each entry point and writes `//# sourceMappingURL=...` comments into the bundles, but the `files` field in `package.json` did not list the maps, so they were excluded from the npm tarball. Bundlers attempting to load the referenced maps would fail with `ENOENT`, producing warnings (or build failures in strict CI setups).
