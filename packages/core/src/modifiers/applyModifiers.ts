import type {FirstArgument, Transform} from '@dnd-kit/utilities';

import type {Modifiers, Modifier} from './types';

export function applyModifiers(
  translateModifiers: Modifiers | undefined,
  {transform, ...args}: FirstArgument<Modifier>
): Transform {
  return translateModifiers?.length
    ? translateModifiers.reduce<Transform>((accumulator, modifier) => {
        return modifier({
          transform: accumulator,
          ...args,
        });
      }, transform)
    : transform;
}
