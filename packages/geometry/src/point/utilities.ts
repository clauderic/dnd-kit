import {Point} from './Point';

/**
 * Returns the distance between a set of points and a point or another set of points
 */
export function averageDistance<X extends Point[], Y extends X>(
  a: [...X],
  b: Point | [...Y]
) {
  const distances = a.reduce((accumulator, currentPoint, index) => {
    const comparisonPoint = Array.isArray(b) ? b[index] : b;

    return accumulator + Point.distance(comparisonPoint, currentPoint);
  }, 0);
  const average = Number((distances / a.length).toFixed(4));

  return average;
}
