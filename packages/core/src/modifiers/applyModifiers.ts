import type {FirstArgument, Transform} from '@dnd-kit/utilities';

import type {Modifiers, Modifier} from './types';

export function applyModifiers<DraggableData, DroppableData>(
  modifiers: Modifiers<DraggableData, DroppableData> | undefined,
  {transform, ...args}: FirstArgument<Modifier<DraggableData, DroppableData>>
): Transform {
  return modifiers?.length
    ? modifiers.reduce<Transform>((accumulator, modifier) => {
        return modifier({
          transform: accumulator,
          ...args,
        });
      }, transform)
    : transform;
}
