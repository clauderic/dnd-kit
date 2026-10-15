import {batch, signal} from '@dnd-kit/state';
import {Sortable} from '@dnd-kit/dom/sortable';

export interface SignalView {
  target: object | null | undefined;
  visible?: boolean;
  property?: string;
}

export interface SignalControls {
  update(view: Partial<SignalView>): void;
  rerender(): void;
  read(property: string): unknown;
}

export interface SignalAdapter extends SignalControls {
  flush(): Promise<unknown>;
  destroy(): void | Promise<void>;
}

export function format(value: unknown) {
  return typeof value === 'object'
    ? (JSON.stringify(value) ?? '')
    : String(value);
}

export function install(
  createAdapter: (host: HTMLElement, view: SignalView) => SignalAdapter
) {
  window.adapterSignalFixture = {
    signal,
    batch,
    Sortable,
    mount(view) {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const adapter = createAdapter(host, view);
      const settle = async () => {
        await adapter.flush();
        // Publish late reads, then allow the framework to render notifications.
        await Promise.resolve();
        await adapter.flush();
      };

      return {
        ...adapter,
        get text() {
          return host.textContent;
        },
        settle,
        async destroy() {
          await adapter.destroy();
          host.remove();
          await settle();
        },
      };
    },
  };
}

declare global {
  interface Window {
    adapterSignalFixture: {
      signal: typeof signal;
      batch: typeof batch;
      Sortable: typeof Sortable;
      mount(view: SignalView): SignalControls & {
        readonly text: string | null;
        settle(): Promise<void>;
        destroy(): Promise<void>;
      };
    };
  }
}
