---
'@dnd-kit/dom': minor
---

Renamed `StyleSheetManager` to `StyleInjector` and centralized CSP `nonce` configuration.

The `StyleInjector` plugin now accepts a `nonce` option that is applied to all injected `<style>` elements. The `nonce` options have been removed from the `Cursor`, `PreventSelection`, and `Feedback` plugin options.

Before:

```ts
const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    Cursor.configure({ nonce: 'abc123' }),
    PreventSelection.configure({ nonce: 'abc123' }),
  ],
});
```

After:

```ts
const manager = new DragDropManager({
  plugins: (defaults) => [
    ...defaults,
    StyleInjector.configure({ nonce: 'abc123' }),
  ],
});
```

The `Cursor` and `PreventSelection` plugins now route their style injection through the `StyleInjector`, so all injected styles respect the centralized `nonce` configuration.
