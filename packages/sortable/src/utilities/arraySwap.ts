/**
 * Swap an array item to a different position. Returns a new array with the item swapped to the new position.
 */
export function arraySwap<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();

  newArray[from] = array[to];
  newArray[to] = array[from];

  return newArray;
}
