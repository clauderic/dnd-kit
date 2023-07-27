import {useEffect} from 'react';
import {effect} from '@dnd-kit/state';

export function useSignalEffect(compute: () => void, deps: any[] = []) {
  useEffect(() => effect(compute), deps);
}
