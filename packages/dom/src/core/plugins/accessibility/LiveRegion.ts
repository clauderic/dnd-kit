export function createLiveRegion(id: string) {
  const element = document.createElement('div');

  element.id = id;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'assertive');
  element.setAttribute('aria-atomic', 'true');
  element.style.setProperty('position', 'fixed');
  element.style.setProperty('width', '1px');
  element.style.setProperty('height', '1px');
  element.style.setProperty('margin', '-1px');
  element.style.setProperty('border', '0');
  element.style.setProperty('padding', '0');
  element.style.setProperty('overflow', 'hidden');
  element.style.setProperty('clip', 'rect(0 0 0 0)');
  element.style.setProperty('clip-path', 'inset(100%)');
  element.style.setProperty('white-space', 'nowrap');

  return element;
}
