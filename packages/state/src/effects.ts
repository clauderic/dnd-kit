import {effect} from '@preact/signals-core';

type Effect = Parameters<typeof effect>[0];
type EffectCleanup = ReturnType<typeof effect>;

export function effects(...entries: Effect[]): EffectCleanup {
  const effects = entries.map(effect);

  return () => effects.forEach((cleanup) => cleanup());
}
