export function isValidIndex(index: number | null): index is number {
  return index !== null && index >= 0;
}
