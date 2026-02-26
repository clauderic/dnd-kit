---
'@dnd-kit/abstract': patch
---

Fixed plugin registration order when deduplicating configured plugins.

When a plugin was provided via `Plugin.configure()` alongside an internally-registered instance of the same plugin, the dedup logic would reorder it to the end of the registration list. This broke plugins like `Feedback` that resolve `StyleInjector` from the registry during construction, since `StyleInjector` would not yet be registered.

This also prevented users from configuring `StyleInjector` with a CSP `nonce` without breaking drag feedback:

```ts
plugins: (defaults) => [...defaults, StyleInjector.configure({ nonce: 'abc123' })]
```
