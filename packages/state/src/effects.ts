import {effect} from '@preact/signals-core';

import type {Effect, CleanupFunction} from './types';

export function effects(...entries: Effect[]): CleanupFunction {
  const effects = entries.map((fn) => effect(fn));

  return () => effects.forEach((cleanup) => cleanup());
}
