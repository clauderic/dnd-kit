export function isScrollable(
  node: HTMLElement,
  computedStyle: CSSStyleDeclaration = window.getComputedStyle(node)
): boolean {
  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];

  return (
    properties.find((property) => {
      const value = computedStyle[property as keyof CSSStyleDeclaration];

      return typeof value === 'string' ? overflowRegex.test(value) : false;
    }) != null
  );
}
