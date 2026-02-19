---
'@dnd-kit/dom': patch
---

Fixed CSS cascade layer ordering so that the popover-reset styles injected by the Feedback plugin no longer override styles from CSS frameworks that use cascade layers (such as Tailwind CSS v4).

The `@layer` block is now named `dnd-kit` and injected via a `<style>` element prepended to `<head>` for document roots, ensuring it is declared first in the cascade with the lowest priority. Shadow DOM roots continue to use `adoptedStyleSheets`.

If needed, consumers can explicitly control the layer ordering:

```css
@layer dnd-kit, base, components, utilities;
```
