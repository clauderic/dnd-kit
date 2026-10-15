<script lang="ts">
  import {createDeepSignal} from '@dnd-kit/svelte/utilities';
  import {
    format,
    type SignalView,
    type SignalControls,
  } from '../../../stories-shared/tests/fixtures/deep-signal.ts';

  let {view, register}: {
    view: SignalView;
    register(controls: SignalControls): void;
  } = $props();
  let target = $state.raw(view.target);
  let visible = $state(view.visible ?? true);
  let property = $state(view.property ?? 'value');
  let revision = $state(0);
  const tracked = createDeepSignal(() => target);
  const read = (key: string) =>
    (tracked.current as Record<string, unknown> | null)?.[key];

  register({
    update(view) {
      if ('target' in view) target = view.target;
      if ('visible' in view) visible = view.visible!;
      if ('property' in view) property = view.property!;
    },
    read,
    rerender: () => {revision++},
  });

  function render() {
    void revision;
    return visible ? format(read(property)) : 'hidden';
  }
</script>

<div>{render()}</div>
