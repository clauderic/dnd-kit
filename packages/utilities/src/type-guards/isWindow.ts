export function isWindow(element: Object): element is typeof window {
  return Object.prototype.toString.call(element) === '[object Window]';
}
