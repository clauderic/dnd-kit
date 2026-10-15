import {createApp, h, nextTick, ref, shallowRef} from 'vue';
import {useDeepSignal} from '@dnd-kit/vue/composables';
import {
  format,
  install,
} from '../../../stories-shared/tests/fixtures/deep-signal.ts';

install((host, view) => {
  const target = shallowRef(view.target);
  const visible = ref(view.visible ?? true);
  const property = ref(view.property ?? 'value');
  const revision = ref(0);
  let read: (property: string) => unknown;
  const app = createApp({
    setup() {
      const tracked = useDeepSignal(target);
      read = (key) => (tracked.value as Record<string, unknown> | null)?.[key];

      return () => {
        void revision.value;
        return h(
          'div',
          visible.value ? format(read(property.value)) : 'hidden'
        );
      };
    },
  });
  app.mount(host);

  return {
    update(view) {
      if ('target' in view) target.value = view.target;
      if ('visible' in view) visible.value = view.visible!;
      if ('property' in view) property.value = view.property!;
    },
    read: (key) => read(key),
    rerender: () => {
      revision.value++;
    },
    flush: nextTick,
    destroy: () => app.unmount(),
  };
});
