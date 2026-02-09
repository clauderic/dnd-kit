export function cloneDeep(object: Object) {
  return JSON.parse(JSON.stringify(object));
}
