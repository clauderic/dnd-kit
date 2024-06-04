import type {AnyData, Modifier} from '@dnd-kit/core';

export function createSnapModifier(
  gridSize: number
): Modifier<AnyData, AnyData> {
  return ({transform}) => ({
    ...transform,
    x: Math.ceil(transform.x / gridSize) * gridSize,
    y: Math.ceil(transform.y / gridSize) * gridSize,
  });
}
