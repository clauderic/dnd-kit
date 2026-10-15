import {mount, tick, unmount} from 'svelte';
import {
  install,
  type SignalControls,
} from '../../../stories-shared/tests/fixtures/deep-signal.ts';
import DeepSignal from './DeepSignal.svelte';

install((host, view) => {
  let controls: SignalControls;
  const component = mount(DeepSignal, {
    target: host,
    props: {
      view,
      register: (value: SignalControls) => {
        controls = value;
      },
    },
  });

  return {
    ...controls!,
    flush: tick,
    destroy: () => unmount(component),
  };
});
