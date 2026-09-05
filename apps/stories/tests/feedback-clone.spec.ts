import {expect, test} from '@playwright/test';

const fixture = `/@fs${new URL('./fixtures/feedback-clone.ts', import.meta.url).pathname}`;

for (const change of [
  'descendant content',
  'target replacement',
  'target registration',
] as const) {
  test(`clone feedback retains target geometry after ${change}`, async ({
    page,
  }) => {
    await page.goto(
      '/iframe.html?id=react-sortable-nested-collections--example&viewMode=story'
    );
    const result = await page.evaluate(
      async ({fixture, change}) => {
        const {
          createPlaceholder,
          createElementMutationObserver,
          DragDropManager,
          Draggable,
          Droppable,
          ProxiedElements,
        } = (await import(
          fixture
        )) as typeof import('./fixtures/feedback-clone.ts');
        const manager = new DragDropManager({plugins: [], sensors: []});
        const element = document.createElement('div');
        element.innerHTML =
          '<header style="width: 120px; height: 40px">Original</header>';
        document.body.appendChild(element);
        let header = element.firstElementChild!;
        const source = new Draggable({id: 'source', element}, manager);
        const self = new Droppable({id: 'source', element: header}, manager);
        const targets = [self];
        self.register();
        const placeholder = createPlaceholder(source, 'clone')!;
        document.body.appendChild(placeholder.element);
        let updates = 0;
        const observer = createElementMutationObserver(
          element,
          placeholder.element,
          () => {
            updates++;
            placeholder.updateChildren();
          }
        );
        const frame = () => new Promise(requestAnimationFrame);
        const initialProxy = self.proxy!;
        const originalHeader = header;
        try {
          // No droppable uses the source root: it still needs a layout placeholder.
          const rootMapping =
            ProxiedElements.get(element) === placeholder.element;
          if (change === 'descendant content') {
            header.setAttribute('data-count', '2');
            await frame();
            header.firstChild!.textContent = 'Updated';
          } else if (change === 'target replacement') {
            header = header.cloneNode(true) as Element;
            element.replaceChildren(header);
            self.element = header;
          } else {
            const child = document.createElement('div');
            child.style.cssText = 'width: 80px; height: 30px';
            element.appendChild(child);
            const target = new Droppable(
              {id: 'child', element: child},
              manager
            );
            target.register();
            targets.push(target);
          }
          await frame();
          const afterUpdate = updates;
          await frame();
          const geometry = targets.map((target) => {
            const shape = target.refreshShape()!.boundingRectangle;
            return {
              connected: target.element!.isConnected,
              insidePlaceholder: placeholder.element.contains(target.element!),
              width: shape.width,
              height: shape.height,
            };
          });
          const copiedText = self.element!.textContent;
          const mapping = ProxiedElements.get(header) === self.proxy;
          const previousMappingRemoved =
            originalHeader === header || !ProxiedElements.has(originalHeader);
          const proxyReplaced =
            self.proxy !== initialProxy && !initialProxy.isConnected;
          observer.disconnect();
          placeholder.element.remove();
          const released =
            targets.every((target) => target.proxy === undefined) &&
            !ProxiedElements.has(element) &&
            !ProxiedElements.has(header) &&
            self.element === header;
          // Repeated cleanup must not erase a mapping acquired by a later owner.
          const nextProxy = document.createElement('div');
          self.proxy = nextProxy;
          ProxiedElements.set(element, nextProxy);
          ProxiedElements.set(header, nextProxy);
          placeholder.element.remove();
          const laterOwnerRetained =
            self.proxy === nextProxy &&
            ProxiedElements.get(element) === nextProxy &&
            ProxiedElements.get(header) === nextProxy;
          self.proxy = undefined;
          ProxiedElements.delete(element);
          ProxiedElements.delete(header);
          return {
            rootMapping,
            mapping,
            previousMappingRemoved,
            proxyReplaced,
            geometry,
            copiedText,
            updates,
            afterUpdate,
            released,
            laterOwnerRetained,
          };
        } finally {
          observer.disconnect();
          placeholder.element.remove();
          for (const target of targets) target.destroy();
          source.destroy();
          manager.destroy();
          element.remove();
        }
      },
      {fixture, change}
    );
    expect(result.rootMapping).toBe(true);
    expect(result.mapping).toBe(true);
    expect(result.previousMappingRemoved).toBe(true);
    expect(result.proxyReplaced).toBe(true);
    expect(result.geometry).toEqual([
      {connected: true, insidePlaceholder: true, width: 120, height: 40},
      ...(change === 'target registration'
        ? [{connected: true, insidePlaceholder: true, width: 80, height: 30}]
        : []),
    ]);
    expect(result.updates).toBe(result.afterUpdate);
    expect(result.updates).toBe(change === 'descendant content' ? 2 : 1);
    if (change === 'descendant content')
      expect(result.copiedText).toBe('Updated');
    expect(result.released).toBe(true);
    expect(result.laterOwnerRetained).toBe(true);
  });
}
