export function patchElement(
  parent: HTMLElement,
  target: Element,
  proxy: Element
) {
  const {insertBefore, appendChild, removeChild} = parent;

  parent.appendChild = ((node: Node) => {
    if (node === target) {
      return appendChild.call(parent, proxy);
    }

    return appendChild.call(parent, node);
  }) as Node['appendChild'];

  parent.insertBefore = ((node: Node, referenceNode: Node | null) => {
    if (node === target) {
      insertBefore.call(parent, proxy, referenceNode);
      return;
    }

    if (referenceNode === target) {
      insertBefore.call(parent, node, proxy);
      return;
    }

    return insertBefore.call(parent, node, referenceNode);
  }) as Node['insertBefore'];

  parent.removeChild = ((node: Node) => {
    if (node === target) {
      return removeChild.call(parent, proxy);
    }

    return removeChild.call(parent, node);
  }) as Node['removeChild'];

  return () => {
    parent.appendChild = appendChild;
    parent.insertBefore = insertBefore;
    parent.removeChild = removeChild;
  };
}
