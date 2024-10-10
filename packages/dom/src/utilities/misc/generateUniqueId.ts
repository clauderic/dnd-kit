const ids: Record<string, number> = {};

export function generateUniqueId(prefix: string) {
  const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
  ids[prefix] = id;

  return `${prefix}-${id}`;
}
