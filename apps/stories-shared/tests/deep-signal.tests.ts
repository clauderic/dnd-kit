import {expect, test, type Page} from '@playwright/test';
import type {} from './fixtures/deep-signal.ts';

export function deepSignalTests(buildFixture: () => Promise<string>) {
  let fixture: string;
  const errors = new WeakMap<Page, string[]>();

  test.beforeAll(async () => {
    fixture = await buildFixture();
  });
  test.beforeEach(async ({page}) => {
    const messages: string[] = [];
    errors.set(page, messages);
    page.on('pageerror', (error) => messages.push(error.message));
    await page.goto('about:blank');
    await page.addScriptTag({content: fixture});
  });
  test.afterEach(async ({page}) => {
    expect(
      errors.get(page),
      'No errors from the framework update cycle'
    ).toEqual([]);
  });

  for (const visible of [true, false]) {
    test(`subscribes to signal properties read ${visible ? 'initially' : 'later'}`, async ({
      page,
    }) => {
      const result = await page.evaluate(async (visible) => {
        const {signal, mount} = window.adapterSignalFixture;
        const source = signal(0);
        const view = mount({
          target: {
            get value() {
              return source.value;
            },
          },
          visible,
        });
        await view.settle();
        const initial = view.text;
        view.update({visible: true});
        await view.settle();
        source.value = 1;
        await view.settle();
        const updated = view.text;
        source.value = 2;
        await view.settle();
        return {initial, updated, final: view.text};
      }, visible);
      expect(result).toEqual({
        initial: visible ? '0' : 'hidden',
        updated: '1',
        final: '2',
      });
    });

    test(`handles fresh objects read ${visible ? 'initially' : 'later'} without looping`, async ({
      page,
    }) => {
      const result = await page.evaluate(async (visible) => {
        const {signal, mount} = window.adapterSignalFixture;
        const source = signal(0);
        const view = mount({
          target: {
            get value() {
              return {count: source.value};
            },
          },
          visible,
        });
        await view.settle();
        view.update({visible: true});
        await view.settle();
        const initial = view.text;
        source.value = 1;
        await view.settle();
        return {initial, updated: view.text};
      }, visible);
      expect(result).toEqual({initial: '{"count":0}', updated: '{"count":1}'});
    });
  }

  test('tracks independently disabled sortable properties', async ({page}) => {
    const result = await page.evaluate(async () => {
      const {Sortable, mount} = window.adapterSignalFixture;
      const sortable = new Sortable(
        {
          id: 'test',
          index: 0,
          register: false,
          disabled: {draggable: true, droppable: false},
        },
        undefined
      );
      const view = mount({target: sortable, property: 'disabled'});
      await view.settle();
      const initial = view.text;
      sortable.disabled = {draggable: false, droppable: true};
      await view.settle();
      return {initial, updated: view.text};
    });
    expect(result).toEqual({
      initial: '{"draggable":true,"droppable":false}',
      updated: '{"draggable":false,"droppable":true}',
    });
  });

  test('does not resubscribe on an unrelated view update', async ({page}) => {
    const reads = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const source = signal(0);
      let reads = 0;
      const view = mount({
        target: {
          get value() {
            reads++;
            return source.value;
          },
        },
      });
      await view.settle();
      const before = reads;
      view.rerender();
      await view.settle();
      return reads - before;
    });
    expect(reads).toBe(1);
  });

  test('does not read properties that the view has never used', async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const visible = signal(0);
      const hidden = signal(0);
      let visibleReads = 0;
      let hiddenReads = 0;
      const view = mount({
        target: {
          get value() {
            visibleReads++;
            return visible.value;
          },
          get hidden() {
            hiddenReads++;
            return hidden.value;
          },
        },
      });
      await view.settle();
      const before = visibleReads;
      hidden.value = 1;
      await view.settle();
      return {
        hiddenReads,
        additionalVisibleReads: visibleReads - before,
        text: view.text,
      };
    });
    expect(result).toEqual({
      hiddenReads: 0,
      additionalVisibleReads: 0,
      text: '0',
    });
  });

  test('retains subscriptions when a property is temporarily hidden', async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const source = signal(0);
      let reads = 0;
      const view = mount({
        target: {
          get value() {
            reads++;
            return source.value;
          },
        },
      });
      await view.settle();
      view.update({visible: false});
      await view.settle();
      const before = reads;
      source.value = 1;
      await view.settle();
      const observedWhileHidden = reads > before;
      view.update({visible: true});
      await view.settle();
      source.value = 2;
      await view.settle();
      return {observedWhileHidden, text: view.text};
    });
    expect(result).toEqual({observedWhileHidden: true, text: '2'});
  });

  test('does not swallow updates when the proxy is read inside a batch', async ({
    page,
  }) => {
    const text = await page.evaluate(async () => {
      const {signal, batch, mount} = window.adapterSignalFixture;
      const source = signal(0);
      const view = mount({
        target: {
          get value() {
            return source.value;
          },
        },
      });
      await view.settle();
      batch(() => {
        source.value = 1;
        view.read('value');
      });
      await view.settle();
      return view.text;
    });
    expect(text).toBe('1');
  });

  test('catches updates before a late subscription has been installed', async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const source = signal(0);
      const view = mount({
        target: {
          get value() {
            return source.value;
          },
        },
        visible: false,
      });
      await view.settle();
      view.update({visible: true});
      view.read('value');
      source.value = 1;
      await view.settle();
      const caught = view.text;
      source.value = 2;
      await view.settle();
      return {caught, updated: view.text};
    });
    expect(result).toEqual({caught: '1', updated: '2'});
  });

  test('releases old keys and subscriptions when targets change', async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const first = signal(0);
      const second = signal(0);
      let reads = 0;
      const targetA = {
        get value() {
          reads++;
          return first.value;
        },
      };
      const targetB = {
        get value(): number {
          throw new Error('Old key leaked');
        },
        get next() {
          return second.value;
        },
      };
      const view = mount({target: targetA});
      await view.settle();
      view.update({target: targetB, property: 'next'});
      await view.settle();
      const before = reads;
      first.value = 1;
      second.value = 2;
      await view.settle();
      const replaced = view.text;
      view.update({target: null});
      await view.settle();
      second.value = 3;
      await view.settle();
      const cleared = view.text;
      view.update({target: undefined});
      await view.settle();
      view.update({target: targetB});
      await view.settle();
      return {oldReads: reads - before, replaced, cleared, restored: view.text};
    });
    expect(result).toEqual({
      oldReads: 0,
      replaced: '2',
      cleared: 'undefined',
      restored: '3',
    });
  });

  test('stops observing after unmount', async ({page}) => {
    const reads = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const source = signal(0);
      let reads = 0;
      const view = mount({
        target: {
          get value() {
            reads++;
            return source.value;
          },
        },
      });
      await view.settle();
      await view.destroy();
      const before = reads;
      source.value = 1;
      await view.settle();
      return reads - before;
    });
    expect(reads).toBe(0);
  });

  test('cancels a pending subscription refresh on unmount', async ({page}) => {
    const reads = await page.evaluate(async () => {
      const {signal, mount} = window.adapterSignalFixture;
      const source = signal(0);
      let reads = 0;
      const view = mount({
        target: {
          get value() {
            reads++;
            return source.value;
          },
        },
        visible: false,
      });
      await view.settle();
      view.read('value');
      const before = reads;
      await view.destroy();
      source.value = 1;
      await view.settle();
      return reads - before;
    });
    expect(reads).toBe(0);
  });
}
