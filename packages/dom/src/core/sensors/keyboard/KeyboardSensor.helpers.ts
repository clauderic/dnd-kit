export type KeyCode = KeyboardEvent['key'];

export function isKeyboardKey(event: KeyboardEvent, codes: KeyCode[]) {
  const eventKey = normalizeKey(event.key);

  return codes.some((code) => normalizeKey(code) === eventKey);
}

const namedKeys = new Set([
  'alt',
  'altgraph',
  'backspace',
  'capslock',
  'control',
  'delete',
  'end',
  'enter',
  'escape',
  'home',
  'insert',
  'meta',
  'pagedown',
  'pageup',
  'pause',
  'printscreen',
  'shift',
  'space',
  'tab',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowup',
  'f1',
  'f2',
  'f3',
  'f4',
  'f5',
  'f6',
  'f7',
  'f8',
  'f9',
  'f10',
  'f11',
  'f12',
]);

function normalizeKey(key: string) {
  if (key === ' ' || key === 'Spacebar') {
    return 'space';
  }

  if (/^Key[A-Z]$/.test(key)) {
    return key.slice(3).toLowerCase();
  }

  if (/^Digit[0-9]$/.test(key)) {
    return key.slice(5);
  }

  if (key.length === 1) {
    return key.toLowerCase();
  }

  const lowerCaseKey = key.toLowerCase();

  return namedKeys.has(lowerCaseKey) ? lowerCaseKey : key;
}
