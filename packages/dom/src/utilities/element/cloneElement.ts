export function cloneElement(element: Element): Element {
  const selector = 'input, textarea, select, canvas, [contenteditable]';
  const clonedElement = element.cloneNode(true) as HTMLElement;
  const fields = Array.from(element.querySelectorAll(selector));
  const clonedFields = Array.from(clonedElement.querySelectorAll(selector));

  clonedFields.forEach((field, index) => {
    const originalField = fields[index];

    if (isField(field) && isField(originalField)) {
      if (field.type !== 'file') {
        field.value = originalField.value;
      }

      // Fixes an issue with original radio buttons losing their value once the
      // clone is inserted in the DOM, as radio button `name` attributes must be unique
      if (field.type === 'radio' && field.name) {
        field.name = `Cloned__${field.name}`;
      }
    }

    if (
      isCanvasElement(field) &&
      isCanvasElement(originalField) &&
      originalField.width > 0 &&
      originalField.height > 0
    ) {
      const destCtx = field.getContext('2d');
      destCtx?.drawImage(originalField, 0, 0);
    }
  });

  return clonedElement;
}

function isField(
  element: Element
): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return 'value' in element;
}

function isCanvasElement(element: Element): element is HTMLCanvasElement {
  return element.tagName === 'CANVAS';
}
