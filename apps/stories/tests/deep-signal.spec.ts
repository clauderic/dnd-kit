import {expect, test} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import type {} from './fixtures/deep-signal.ts';

let fixture: string;

test.beforeAll(async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    define: {'process.env.NODE_ENV': '"development"'},
    build: {
      write: false,
      minify: false,
      lib: {
        entry: fileURLToPath(
          new URL('./fixtures/deep-signal.ts', import.meta.url)
        ),
        name: 'deepSignalFixture',
        formats: ['iife'],
      },
    },
  });
  const bundle = Array.isArray(result) ? result[0] : result;
  if (!('output' in bundle)) throw new Error('Expected a fixture bundle');
  const chunk = bundle.output.find((output) => output.type === 'chunk');
  if (!chunk) throw new Error('Missing fixture bundle');
  fixture = chunk.code;
});

test.beforeEach(async ({page}) => {
  await page.goto('about:blank');
  await page.addScriptTag({content: fixture});
});

for (const strict of [false, true]) {
  test.describe(strict ? 'Deep signal (Strict Mode)' : 'Deep signal', () => {
    test('subscribes to late reads and preserves earlier subscriptions', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const first = signal(0);
          const second = signal(0);
          const target = {
            get first() {
              return first.value;
            },
            get second() {
              return second.value;
            },
          };
          let renders = 0;
          function View({show}: {show: boolean}) {
            const proxy = useDeepSignal(target);
            renders++;
            return createElement(
              'div',
              null,
              `${proxy.first}:${show ? proxy.second : '-'}`
            );
          }
          await root.render(createElement(View, {show: false}));
          const before = renders;
          await act(async () => {
            second.value = 1;
          });
          const unreadDidNotRender = renders === before;
          await root.render(createElement(View, {show: true}));
          await act(async () => {
            second.value = 2;
          });
          const afterLateRead = root.text;
          await root.render(createElement(View, {show: false}));
          const beforeHiddenUpdate = renders;
          await act(async () => {
            second.value = 3;
          });
          const retainedSubscription = renders > beforeHiddenUpdate;
          await root.render(createElement(View, {show: true}));
          return {
            unreadDidNotRender,
            afterLateRead,
            retainedSubscription,
            final: root.text,
          };
        });
      }, strict);
      expect(result).toEqual({
        unreadDidNotRender: true,
        afterLateRead: '0:2',
        retainedSubscription: true,
        final: '0:3',
      });
    });

    test('reads object-valued sortable.disabled without a render loop', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          useSortable,
          DragDropProvider,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          let sortable: ReturnType<typeof useSortable>['sortable'];
          function View() {
            sortable = useSortable({
              id: 'test',
              index: 0,
              disabled: {draggable: true, droppable: false},
            }).sortable;
            return createElement(
              'div',
              null,
              JSON.stringify(sortable.disabled)
            );
          }
          await root.render(
            createElement(DragDropProvider, null, createElement(View))
          );
          const initial = root.text;
          await act(async () => {
            sortable.disabled = {draggable: false, droppable: true};
          });
          return {initial, updated: root.text};
        });
      }, strict);
      expect(result).toEqual({
        initial: '{"draggable":true,"droppable":false}',
        updated: '{"draggable":false,"droppable":true}',
      });
    });

    test('keeps the proxy and subscriptions stable on ordinary renders', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {createElement},
          run,
          signal,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const source = signal(0);
          let reads = 0;
          const target = {
            get value() {
              reads++;
              return source.value;
            },
          };
          let proxy: typeof target;
          function View({tick}: {tick: number}) {
            proxy = useDeepSignal(target);
            return createElement('div', null, `${proxy.value}:${tick}`);
          }
          await root.render(createElement(View, {tick: 0}));
          const firstProxy = proxy!;
          const before = reads;
          await root.render(createElement(View, {tick: 1}));
          return {stableProxy: proxy! === firstProxy, reads: reads - before};
        });
      }, strict);
      expect(result).toEqual({stableProxy: true, reads: strict ? 2 : 1});
    });

    test('releases old keys and subscriptions when the target changes', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const first = signal(0);
          const second = signal(0);
          let oldReads = 0;
          const targetA = {
            get first() {
              oldReads++;
              return first.value;
            },
          };
          const targetB = {
            get first(): number {
              throw new Error('Old key leaked into new target');
            },
            get second() {
              return second.value;
            },
          };
          // Keep getter-bearing targets out of props: React's development
          // performance logging reads enumerable props independently of the hook.
          let target: object | null | undefined = targetA;
          function View({property}: {property: string}) {
            const proxy = useDeepSignal(target) as
              | Record<string, number>
              | null
              | undefined;
            return createElement('div', null, proxy?.[property] ?? 'none');
          }
          await root.render(createElement(View, {property: 'first'}));
          target = targetB;
          await root.render(createElement(View, {property: 'second'}));
          const before = oldReads;
          await act(async () => {
            first.value = 1;
            second.value = 2;
          });
          const replaced = root.text;
          target = null;
          await root.render(createElement(View, {property: 'second'}));
          await act(async () => {
            second.value = 3;
          });
          const cleared = root.text;
          target = undefined;
          await root.render(createElement(View, {property: 'second'}));
          target = targetB;
          await root.render(createElement(View, {property: 'second'}));
          return {
            oldReads: oldReads - before,
            replaced,
            cleared,
            restored: root.text,
          };
        });
      }, strict);
      expect(result).toEqual({
        oldReads: 0,
        replaced: '2',
        cleared: 'none',
        restored: '3',
      });
    });

    for (const initiallyRead of [false, true]) {
      for (const synchronous of [false, true]) {
        test(`catches render-to-commit updates (initial=${initiallyRead}, sync=${synchronous})`, async ({
          page,
        }) => {
          const result = await page.evaluate(
            async ({strict, initiallyRead, synchronous}) => {
              const {
                React: {createElement, useLayoutEffect},
                run,
                signal,
                useDeepSignal,
              } = window.deepSignalFixture;
              return run(strict, async (root) => {
                const source = signal(0);
                const target = {
                  get value() {
                    return source.value;
                  },
                };
                function Mutate() {
                  useLayoutEffect(() => {
                    source.value = 1;
                  }, []);
                  return null;
                }
                function View({show}: {show: boolean}) {
                  const proxy = useDeepSignal(target, () => synchronous);
                  return createElement(
                    'div',
                    null,
                    show ? proxy.value : 'none',
                    show ? createElement(Mutate) : null
                  );
                }
                if (!initiallyRead)
                  await root.render(createElement(View, {show: false}));
                await root.render(createElement(View, {show: true}));
                return root.text;
              });
            },
            {strict, initiallyRead, synchronous}
          );
          expect(result).toBe('1');
        });
      }
    }

    test('does not swallow a notification when the proxy is read in a batch', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          batch,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const source = signal(0);
          const target = {
            get value() {
              return source.value;
            },
          };
          let proxy: typeof target;
          function View() {
            proxy = useDeepSignal(target);
            return createElement('div', null, proxy.value);
          }
          await root.render(createElement(View));
          await act(async () => {
            batch(() => {
              source.value = 1;
              void proxy.value;
            });
          });
          return root.text;
        });
      }, strict);
      expect(result).toBe('1');
    });

    test('uses the latest synchronous update predicate', async ({page}) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const source = signal(0);
          const target = {
            get value() {
              return source.value;
            },
          };
          const calls: string[] = [];
          function View({predicate}: {predicate: () => boolean}) {
            const proxy = useDeepSignal(target, predicate);
            return createElement('div', null, proxy.value);
          }
          await root.render(
            createElement(View, {
              predicate: () => {
                calls.push('first');
                return false;
              },
            })
          );
          await root.render(
            createElement(View, {
              predicate: () => {
                calls.push('second');
                return true;
              },
            })
          );
          await act(async () => {
            source.value = 1;
          });
          return {text: root.text, calls};
        });
      }, strict);
      expect(result).toEqual({text: '1', calls: ['second']});
    });

    test('preserves a synchronous update request when another property changes', async ({
      page,
    }) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          batch,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const first = signal(0);
          const second = signal(0);
          const target = {
            get first() {
              return first.value;
            },
            get second() {
              return second.value;
            },
          };
          function View() {
            const proxy = useDeepSignal(target, (key) => key === 'first');
            return createElement('div', null, `${proxy.first}:${proxy.second}`);
          }
          await root.render(createElement(View));
          let afterMicrotask: string | null = null;
          await act(async () => {
            batch(() => {
              first.value = 1;
              second.value = 1;
            });
            await Promise.resolve();
            afterMicrotask = root.text;
          });
          return afterMicrotask;
        });
      }, strict);
      expect(result).toBe('1:1');
    });

    test('stops observing after unmount', async ({page}) => {
      const result = await page.evaluate(async (strict) => {
        const {
          React: {act, createElement},
          run,
          signal,
          useDeepSignal,
        } = window.deepSignalFixture;
        return run(strict, async (root) => {
          const source = signal(0);
          let reads = 0;
          const target = {
            get value() {
              reads++;
              return source.value;
            },
          };
          function View() {
            const proxy = useDeepSignal(target);
            return createElement('div', null, proxy.value);
          }
          await root.render(createElement(View));
          await root.render(null);
          const before = reads;
          await act(async () => {
            source.value = 1;
          });
          return reads - before;
        });
      }, strict);
      expect(result).toBe(0);
    });
  });
}
