---
"@dnd-kit/accessibility": major
"@dnd-kit/core": major
"@dnd-kit/modifiers": major
"@dnd-kit/sortable": major
"@dnd-kit/utilities": major
---

Distributed assets now only target modern browsers. [Browserlist](https://github.com/browserslist/browserslist) config:

```
defaults
last 2 version
not IE 11
not dead
```

If you need to support older browsers, include the appropriate polyfills in your project's build process.
