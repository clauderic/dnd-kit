export const ATTR_PREFIX = 'data-dnd-';
export const CSS_PREFIX = '--dnd-';
export const ATTRIBUTE = `${ATTR_PREFIX}dragging`;
export const PLACEHOLDER_ATTRIBUTE = `${ATTR_PREFIX}placeholder`;

export const IGNORED_ATTRIBUTES = [
  ATTRIBUTE,
  PLACEHOLDER_ATTRIBUTE,
  'popover',
  'aria-pressed',
  'aria-grabbing',
];

export const IGNORED_STYLES = ['view-transition-name'];

export const CSS_RULES = `
  [${ATTRIBUTE}] {
    position: fixed !important;
    pointer-events: none !important;
    touch-action: none !important;
    z-index: calc(infinity);
    will-change: translate;
    top: var(${CSS_PREFIX}top, 0px) !important;
    left: var(${CSS_PREFIX}left, 0px) !important;
    right: unset !important;
    bottom: unset !important;
    width: var(${CSS_PREFIX}width, auto) !important;
    height: var(${CSS_PREFIX}height, auto) !important;
    box-sizing: border-box;
  }
  [${ATTRIBUTE}] * {
    pointer-events: none !important;
  }
  [${ATTRIBUTE}][style*='${CSS_PREFIX}translate'] {
    translate: var(${CSS_PREFIX}translate) !important;
  }
  [style*='${CSS_PREFIX}transition'] {
    transition: var(${CSS_PREFIX}transition) !important;
  }
  [style*='${CSS_PREFIX}scale'] {
    scale: var(${CSS_PREFIX}scale) !important;
    transform-origin: var(${CSS_PREFIX}transform-origin) !important;
  }
  *:where([${ATTRIBUTE}][popover]) {
    overflow: visible;
    background: unset;
    border: unset;
    margin: unset;
    padding: unset;
    color: inherit;
  }
  [${ATTRIBUTE}]::backdrop, [${ATTR_PREFIX}overlay]:not([${ATTRIBUTE}]) {
    display: none;
  }
  html:has([${ATTRIBUTE}]) * {
    user-select: none;
    -webkit-user-select: none;
  }
`
  .replace(/\n+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
