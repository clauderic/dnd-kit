export const getMaxValueIndex = (array: number[]) =>
  getValueIndex(array, (value, tracked) => value > tracked);

export const getMinValueIndex = (array: number[]) =>
  getValueIndex(array, (value, tracked) => value < tracked);

/**
 * Returns the index of the smallest number in an array of numbers
 */
export function getValueIndex(
  array: number[],
  comparator: (value: number, tracked: number) => boolean
) {
  if (array.length === 0) {
    return -1;
  }

  let tracked = array[0];
  let index = 0;

  for (var i = 1; i < array.length; i++) {
    if (comparator(array[i], tracked)) {
      index = i;
      tracked = array[i];
    }
  }

  return index;
}
