export function cloneDeep(obejct: Object) {
  return JSON.parse(JSON.stringify(obejct));
}
