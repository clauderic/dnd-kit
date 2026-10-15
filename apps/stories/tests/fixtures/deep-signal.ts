import * as React from 'react';
import {createRoot} from 'react-dom/client';
import {DragDropProvider} from '@dnd-kit/react';
import {useDeepSignal} from '@dnd-kit/react/hooks';
import {useSortable} from '@dnd-kit/react/sortable';
import {batch, signal} from '@dnd-kit/state';

function createHarness(strict: boolean) {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);

  return {
    get text() {
      return host.textContent;
    },
    async render(element: React.ReactNode) {
      await React.act(async () => {
        root.render(
          strict
            ? React.createElement(React.StrictMode, null, element)
            : element
        );
      });
    },
    async unmount() {
      await React.act(async () => root.unmount());
      host.remove();
    },
  };
}

async function run<T>(
  strict: boolean,
  callback: (harness: ReturnType<typeof createHarness>) => Promise<T>
): Promise<T> {
  const harness = createHarness(strict);

  try {
    return await callback(harness);
  } finally {
    await harness.unmount();
  }
}

const fixture = {
  React,
  DragDropProvider,
  useDeepSignal,
  useSortable,
  batch,
  signal,
  run,
};

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;

  interface Window {
    deepSignalFixture: typeof fixture;
  }
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.deepSignalFixture = fixture;
