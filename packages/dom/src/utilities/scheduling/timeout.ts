export function timeout(callback: () => void, duration: number): () => void {
  const id = setTimeout(callback, duration);

  return () => clearTimeout(id);
}
