/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice();
  [newArray[from], newArray[to]] = [newArray[from], newArray[to]];
  return newArray;
}
