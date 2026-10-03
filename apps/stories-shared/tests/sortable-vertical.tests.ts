import {test, expect} from './fixtures.ts';

interface SortableVerticalStories {
  basicSetup: string;
  withDragHandle: string;
}

export function sortableVerticalTests(stories: SortableVerticalStories) {
  test.describe('Sortable vertical list', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto(stories.basicSetup);
      await expect(dnd.items.first()).toBeVisible();
    });

    test('reorder items down with pointer', async ({dnd}) => {
      const first = dnd.items.nth(0);
      const third = dnd.items.nth(2);

      await expect(first).toHaveText('1');

      await dnd.pointer.drag(first, third);
      await dnd.waitForDrop();

      await expect(dnd.items.nth(0)).toHaveText('2');
      await expect(dnd.items.nth(1)).toHaveText('3');
      await expect(dnd.items.nth(2)).toHaveText('1');
    });

    test('reorder items up with pointer', async ({dnd}) => {
      const third = dnd.items.nth(2);
      const first = dnd.items.nth(0);

      await dnd.pointer.drag(third, first);
      await dnd.waitForDrop();

      await expect(dnd.items.nth(0)).toHaveText('3');
      await expect(dnd.items.nth(1)).toHaveText('1');
      await expect(dnd.items.nth(2)).toHaveText('2');
    });

    test('reorder items with keyboard', async ({dnd}) => {
      const first = dnd.items.nth(0);

      await dnd.keyboard.pickup(first);
      await dnd.keyboard.move('down', 2);
      await dnd.keyboard.drop();
      await dnd.waitForDrop();

      await expect(dnd.items.nth(0)).toHaveText('2');
      await expect(dnd.items.nth(1)).toHaveText('3');
      await expect(dnd.items.nth(2)).toHaveText('1');
    });

    test('cancel keyboard drag restores order', async ({dnd}) => {
      const first = dnd.items.nth(0);

      await dnd.keyboard.pickup(first);
      await dnd.keyboard.move('down', 3);
      await dnd.keyboard.cancel();
      await dnd.waitForDrop();

      await expect(dnd.items.nth(0)).toHaveText('1');
      await expect(dnd.items.nth(1)).toHaveText('2');
      await expect(dnd.items.nth(2)).toHaveText('3');
      await expect(dnd.items.nth(3)).toHaveText('4');
    });

    test('placeholder is visible during drag', async ({dnd}) => {
      const first = dnd.items.nth(0);
      const third = dnd.items.nth(2);

      const sourceBox = await first.boundingBox();
      const targetBox = await third.boundingBox();

      await dnd.page.mouse.move(
        sourceBox!.x + sourceBox!.width / 2,
        sourceBox!.y + sourceBox!.height / 2
      );
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(
        targetBox!.x + targetBox!.width / 2,
        targetBox!.y + targetBox!.height / 2,
        {steps: 10}
      );

      await expect(dnd.dragging).toHaveCount(1);
      await expect(dnd.placeholder).toHaveCount(1);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('placeholder takes the slot before the source leaves the flow', async ({
      dnd,
    }) => {
      await dnd.page.evaluate(() => {
        const order: string[] = [];
        (window as any).__dndOrder = order;

        new MutationObserver((records) => {
          for (const record of records) {
            if (
              record.type === 'attributes' &&
              (record.target as Element).hasAttribute('data-dnd-dragging')
            ) {
              order.push('dragging');
            }

            for (const node of record.addedNodes) {
              if (
                node instanceof Element &&
                node.hasAttribute('data-dnd-placeholder')
              ) {
                order.push('placeholder');
              }
            }
          }
        }).observe(document.body, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ['data-dnd-dragging'],
        });
      });

      const first = dnd.items.nth(0);
      const third = dnd.items.nth(2);

      const sourceBox = await first.boundingBox();
      const targetBox = await third.boundingBox();

      await dnd.page.mouse.move(
        sourceBox!.x + sourceBox!.width / 2,
        sourceBox!.y + sourceBox!.height / 2
      );
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(
        targetBox!.x + targetBox!.width / 2,
        targetBox!.y + targetBox!.height / 2,
        {steps: 10}
      );

      await expect(dnd.placeholder).toHaveCount(1);
      expect(
        await dnd.page.evaluate(() => (window as any).__dndOrder.slice(0, 2))
      ).toEqual(['placeholder', 'dragging']);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });

  test.describe('Sortable vertical list with drag handle', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto(stories.withDragHandle);
      await expect(dnd.items.first()).toBeVisible();
    });

    test('reorder using drag handle with keyboard', async ({dnd}) => {
      const firstHandle = dnd.handles.nth(0);

      await dnd.keyboard.pickup(firstHandle);
      await dnd.keyboard.move('down', 2);
      await dnd.keyboard.drop();
      await dnd.waitForDrop();

      await expect(dnd.items.nth(0)).toHaveText('2');
      await expect(dnd.items.nth(1)).toHaveText('3');
      await expect(dnd.items.nth(2)).toHaveText('1');
    });
  });
}
