export function createHiddenText(id: string, value: string) {
  const element = document.createElement('div');

  element.id = id;
  element.style.setProperty('display', 'none');
  element.textContent = value;

  return element;
}
