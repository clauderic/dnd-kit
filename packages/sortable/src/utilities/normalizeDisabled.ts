import type {Disabled} from '../types';

export function normalizeDisabled(disabled: boolean | Disabled): Disabled {
  if (typeof disabled === 'boolean') {
    return {
      draggable: disabled,
      droppable: disabled,
    };
  }

  return disabled;
}
