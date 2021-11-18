---
"@dnd-kit/core": patch
"@dnd-kit/utilities": patch
---

Helpers have been updated to support rendering in foreign `window` contexts (via `ReactDOM.render` or  `ReactDOM.createPortal`). 

For example, checking if an element is an instance of an `HTMLElement` is normally done like so:

```ts
if (element instanceof HTMLElement)
```

However, when rendering in a different window, this can return false even if the element is indeed an HTMLElement, because this code is equivalent to:

```ts
if (element instanceof window.HTMLElement)
```

And in this case, the `window` of the `element` is different from the main execution context `window`, because we are rendering via a portal into another window.

This can be solved by finding the local window of the element:

```ts
const elementWindow = element.ownerDocument.defaultView;

if (element instanceof elementWindow.HTMLElement)
```
