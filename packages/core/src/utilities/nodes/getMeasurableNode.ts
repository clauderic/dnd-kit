export function getMeasurableNode(
  node: HTMLElement | undefined | null
): HTMLElement | null {
  if (!node) {
    return null;
  }

  if (node.children.length > 1) {
    return node;
  }
  const firstChild = node.children[0];

  return firstChild instanceof HTMLElement ? firstChild : node;
}
