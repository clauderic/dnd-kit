export function supportsPopover(element: Element): element is Element & {
  showPopover(): void;
  hidePopover(): void;
} {
  return (
    'showPopover' in element &&
    'hidePopover' in element &&
    typeof element.showPopover === 'function' &&
    typeof element.hidePopover === 'function'
  );
}
