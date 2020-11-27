export function omit<T>(id: string, elements: Record<string, T>) {
  const {[id]: _, ...other} = elements;

  return other;
}
