export function parseScale(scale: string) {
  if (scale === 'none') {
    return null;
  }

  const values = scale.split(' ');
  const x = parseFloat(values[0]);
  const y = parseFloat(values[1]);

  if (isNaN(x) && isNaN(y)) {
    return null;
  }

  return {
    x: isNaN(x) ? y : x,
    y: isNaN(y) ? x : y,
  };
}
