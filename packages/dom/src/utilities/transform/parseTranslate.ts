export function parseTranslate(translate: string) {
  if (translate === 'none') {
    return null;
  }

  const [x, y, z = '0'] = translate.split(' ');
  const output = {x: parseFloat(x), y: parseFloat(y), z: parseInt(z, 10)};

  if (isNaN(output.x) && isNaN(output.y)) {
    return null;
  }

  return {
    x: isNaN(output.x) ? 0 : output.x,
    y: isNaN(output.y) ? 0 : output.y,
    z: isNaN(output.z) ? 0 : output.z,
  };
}
