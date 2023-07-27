export function encode(data: Record<string, any>) {
  return encodeUpperCase(btoa(JSON.stringify(data)));
}

export function decode(data: string) {
  return JSON.parse(atob(decodeUpperCase(data)));
}

const PREFIX = '\u200B\u200C';
const SUFFIX = '\u200C\u200B';

function encodeUpperCase(str: string): string {
  return str.replace(/([A-Z]+)/g, `${PREFIX}$1${SUFFIX}`);
}

function decodeUpperCase(str: string): string {
  const escapeRegExp = (escape: string) => ['', ...escape.split('')].join('\\');

  return str.replace(
    new RegExp(`${escapeRegExp(PREFIX)}(.*?)${escapeRegExp(SUFFIX)}`, 'g'),
    (_, match: string) => match.toUpperCase()
  );
}
