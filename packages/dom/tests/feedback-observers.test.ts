import {expect, it, mock} from 'bun:test';

import {createDocumentMutationObserver} from '../src/core/plugins/feedback/observers.ts';

it('reopens move feedback when the dragged element is reinserted', () => {
  const originalObserver = Object.getOwnPropertyDescriptor(
    globalThis,
    'MutationObserver'
  );
  let notify!: (records: MutationRecord[]) => void;
  Object.defineProperty(globalThis, 'MutationObserver', {
    configurable: true,
    value: class {
      constructor(callback: typeof notify) {
        notify = callback;
      }
      observe() {}
    },
  });

  let open = true;
  const showPopover = mock(() => {
    open = true;
  });
  const element = {
    ownerDocument: {body: {}},
    isConnected: true,
    nextElementSibling: null,
    contains: (node: unknown) => node === element,
    hasAttribute: (name: string) => name === 'popover',
    matches: (selector: string) => selector === ':popover-open' && open,
    showPopover,
    hidePopover() {},
  } as unknown as Element;

  try {
    createDocumentMutationObserver(element, null, element);

    open = false;
    notify([
      {addedNodes: [{contains: () => false}]},
    ] as unknown as MutationRecord[]);
    expect(showPopover).not.toHaveBeenCalled();

    notify([{addedNodes: [element]}] as unknown as MutationRecord[]);
    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(open).toBe(true);
  } finally {
    if (originalObserver) {
      Object.defineProperty(globalThis, 'MutationObserver', originalObserver);
    } else {
      Reflect.deleteProperty(globalThis, 'MutationObserver');
    }
  }
});
