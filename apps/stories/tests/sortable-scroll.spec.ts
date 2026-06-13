import type {Locator, Page} from '@playwright/test';
import {test, expect} from '../../stories-shared/tests/fixtures.ts';

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
      await dnd.page.mouse.move(box!.x + box!.width / 2, viewport.height - 10, {
        steps: 20,
      });

      // Wait for auto-scroll to kick in
      await expect
        .poll(
          () =>
            dnd.page.evaluate(() => document.scrollingElement?.scrollTop ?? 0),
          {timeout: 3_000}
        )
        .toBeGreaterThan(scrollBefore);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('scrolls when moving with keyboard arrow keys', async ({dnd}) => {
      await dnd.page.emulateMedia({reducedMotion: 'reduce'});

      // Find the last visible item (closest to bottom of viewport)
      const viewport = dnd.page.viewportSize()!;
      const count = await dnd.items.count();
      let lastVisibleIndex = 0;

      for (let i = 0; i < count; i++) {
        const box = await dnd.items.nth(i).boundingBox();
        if (!box || box.y + box.height > viewport.height) break;
        lastVisibleIndex = i;
      }

      const item = dnd.items.nth(lastVisibleIndex);

      await dnd.keyboard.pickup(item);
      await dnd.keyboard.move('down');

      await expect
        .poll(
          () =>
            dnd.page.evaluate(() => document.scrollingElement?.scrollTop ?? 0),
          {timeout: 5_000}
        )
        .toBeGreaterThan(0);

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
      const container = dnd.page.locator('#storybook-root ul').first();
      const firstItem = container.locator('.Item').first();
      const containerBox = await container.boundingBox();
      const itemBox = await firstItem.boundingBox();

      const scrollBefore = await container.evaluate((el) => el.scrollTop);

      await dnd.page.mouse.move(
        itemBox!.x + itemBox!.width / 2,
        itemBox!.y + itemBox!.height / 2
      );
      await dnd.page.mouse.down();

      await dnd.page.mouse.move(
        containerBox!.x + containerBox!.width / 2,
        containerBox!.y + containerBox!.height - 10,
        {steps: 20}
      );

      // Wait for auto-scroll to kick in
      await expect
        .poll(() => container.evaluate((el) => el.scrollTop), {
          timeout: 3_000,
        })
        .toBeGreaterThan(scrollBefore);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });

  test.describe('Scrollable sibling items', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto('react-sortable-vertical-list--scrollable-sibling-items');
      await expect(dnd.page.getByTestId('scrollable-item-1')).toBeVisible();
    });

    test('does not scroll sibling item content when dragging top-to-bottom', async ({
      dnd,
    }) => {
      const sibling = dnd.page.getByTestId('scrollable-item-2');
      const scrollBefore = await sibling.evaluate((element) => {
        element.scrollTop = 0;

        return element.scrollTop;
      });

      await dragAndHoldOverSibling({
        dnd,
        testIdPrefix: 'scrollable-item',
        sourceId: 1,
        siblingId: 2,
        edge: 'bottom',
      });

      try {
        await expect
          .poll(() => sibling.evaluate((element) => element.scrollTop))
          .toBe(scrollBefore);
      } finally {
        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      }
    });

    test('does not scroll sibling item content when dragging bottom-to-top', async ({
      dnd,
    }) => {
      const sibling = dnd.page.getByTestId('scrollable-item-2');
      const scrollBefore = await sibling.evaluate((element) => {
        element.scrollTop = 120;

        return element.scrollTop;
      });

      await dragAndHoldOverSibling({
        dnd,
        testIdPrefix: 'scrollable-item',
        sourceId: 3,
        siblingId: 2,
        edge: 'top',
      });

      try {
        await expect
          .poll(() => sibling.evaluate((element) => element.scrollTop))
          .toBe(scrollBefore);
      } finally {
        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      }
    });
  });
});

async function dragAndHoldOverSibling({
  dnd,
  edge,
  siblingId,
  sourceId,
  testIdPrefix,
}: {
  dnd: {
    page: Page;
    dragging: Locator;
    waitForDrop(): Promise<void>;
  };
  edge: 'top' | 'bottom';
  siblingId: number;
  sourceId: number;
  testIdPrefix: string;
}) {
  const source = dnd.page.getByTestId(`${testIdPrefix}-${sourceId}`);
  const sibling = dnd.page.getByTestId(`${testIdPrefix}-${siblingId}`);
  const handle = source.locator('.handle');
  const handleBox = await handle.boundingBox();
  const siblingBox = await sibling.boundingBox();

  if (!handleBox || !siblingBox) {
    throw new Error('Could not get bounding box for draggable or sibling');
  }

  const start = {
    x: handleBox.x + handleBox.width / 2,
    y: handleBox.y + handleBox.height / 2,
  };
  const destination = {
    x: siblingBox.x + siblingBox.width / 2,
    y:
      edge === 'bottom'
        ? siblingBox.y + siblingBox.height - 8
        : siblingBox.y + 8,
  };

  await dnd.page.mouse.move(start.x, start.y);
  await dnd.page.mouse.down();
  await dnd.page.mouse.move(destination.x, destination.y, {steps: 24});
  await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});
  await dnd.page.waitForTimeout(700);
}
