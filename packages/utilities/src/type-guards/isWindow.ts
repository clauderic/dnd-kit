export function isWindow(element: Object): element is typeof window {
  let str = Object.prototype.toString.call(element)
  return str === '[object Window]' || str === '[object global]';
}
