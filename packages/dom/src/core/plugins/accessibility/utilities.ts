import {getWindow} from '@dnd-kit/dom/utilities';

export function isFocusable(element: Element) {
  const window = getWindow(element);

  return (
    element instanceof window.HTMLInputElement ||
    element instanceof window.HTMLSelectElement ||
    element instanceof window.HTMLTextAreaElement ||
    element instanceof window.HTMLAnchorElement ||
    element instanceof window.HTMLButtonElement ||
    element instanceof window.HTMLAreaElement
  );
}

const ids: Record<string, number> = {};

export function generateUniqueId(prefix: string) {
  const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
  ids[prefix] = id;

  return `${prefix}-${id}`;
}
