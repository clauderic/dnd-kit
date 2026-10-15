import {batch, createRoot, createSignal, createRenderEffect} from 'solid-js';
import {useDeepSignal} from '@dnd-kit/solid/hooks';
import {
  format,
  install,
  type SignalView,
} from '../../../stories-shared/tests/fixtures/deep-signal.ts';

install((host, view) =>
  createRoot((dispose) => {
    const [target, setTarget] = createSignal(view.target);
    const [visible, setVisible] = createSignal(view.visible ?? true);
    const [property, setProperty] = createSignal(view.property ?? 'value');
    const [revision, setRevision] = createSignal(0);
    const tracked = useDeepSignal(target);
    const read = (key: string) =>
      (tracked() as Record<string, unknown> | null)?.[key];

    createRenderEffect(() => {
      void revision();
      host.textContent = visible() ? format(read(property())) : 'hidden';
    });

    return {
      update(view: Partial<SignalView>) {
        batch(() => {
          if ('target' in view) setTarget(() => view.target);
          if ('visible' in view) setVisible(view.visible!);
          if ('property' in view) setProperty(view.property!);
        });
      },
      read,
      rerender: () => {
        setRevision((value) => value + 1);
      },
      flush: () => Promise.resolve(),
      destroy: dispose,
    };
  })
);
