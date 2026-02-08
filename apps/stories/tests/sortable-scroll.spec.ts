import {test, expect} from './fixtures.ts';

test.describe('Auto-scrolling', () => {
  test.describe('Vertical list (100 items)', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto('react-sortable-vertical-list--basic-setup');
      await expect(dnd.items.first()).toBeVisible();
    });

    test('auto-scrolls down when dragging near bottom edge with pointer', async ({
      dnd,
    }) => {
      const first = dnd.items.nth(0);
      const box = await first.boundingBox();
      const viewport = dnd.page.viewportSize()!;

      const scrollBefore = await dnd.page.evaluate(
        () => document.scrollingElement?.scrollTop ?? 0
      );

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();

      // Drag toward the bottom edge of the viewport
      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        viewport.height - 10,
        {steps: 20}
      );

      // Hold near the edge to trigger auto-scroll
      await dnd.page.waitForTimeout(1000);

      const scrollAfter = await dnd.page.evaluate(
        () => document.scrollingElement?.scrollTop ?? 0
      );

      expect(scrollAfter).toBeGreaterThan(scrollBefore);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('scrolls when moving with keyboard arrow keys', async ({dnd}) => {
      const first = dnd.items.nth(0);

      await dnd.keyboard.pickup(first);

      // Move down many positions to trigger scrolling
      await dnd.keyboard.move('down', 15);

      const scrollAfter = await dnd.page.evaluate(
        () => document.scrollingElement?.scrollTop ?? 0
      );

      expect(scrollAfter).toBeGreaterThan(0);

      await dnd.keyboard.drop();
      await dnd.waitForDrop();
    });
  });

  test.describe('Scrollable containers', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto('react-sortable-multiple-lists--scrollable');
      await expect(dnd.items.first()).toBeVisible();
    });

    test('auto-scrolls within a scrollable container with pointer', async ({
      dnd,
    }) => {
      // Find the first scrollable container
      const container = dnd.page
        .locator('#storybook-root ul')
        .first();
      const firstItem = container.locator('.Item').first();
      const containerBox = await container.boundingBox();
      const itemBox = await firstItem.boundingBox();

      const scrollBefore = await container.evaluate(
        (el) => el.scrollTop
      );

      await dnd.page.mouse.move(
        itemBox!.x + itemBox!.width / 2,
        itemBox!.y + itemBox!.height / 2
      );
      await dnd.page.mouse.down();

      // Drag toward the bottom edge of the container
      await dnd.page.mouse.move(
        containerBox!.x + containerBox!.width / 2,
        containerBox!.y + containerBox!.height - 10,
        {steps: 20}
      );

      // Hold near the edge to trigger auto-scroll
      await dnd.page.waitForTimeout(1000);

      const scrollAfter = await container.evaluate(
        (el) => el.scrollTop
      );

      expect(scrollAfter).toBeGreaterThan(scrollBefore);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });
});
