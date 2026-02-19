import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('AutoScroller options', () => {
  test.describe('threshold: 0 (disabled)', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto('react-sortable-vertical-list--auto-scroll-disabled');
      await expect(dnd.items.first()).toBeVisible();
    });

    test('does not auto-scroll when dragging near the bottom edge', async ({
      dnd,
    }) => {
      const first = dnd.items.nth(0);
      const box = await first.boundingBox();
      const viewport = dnd.page.viewportSize()!;

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        viewport.height - 10,
        {steps: 20}
      );

      // Wait to give auto-scroll a chance to activate (it shouldn't)
      await dnd.page.waitForTimeout(500);

      const scrollTop = await dnd.page.evaluate(
        () => document.scrollingElement?.scrollTop ?? 0
      );

      expect(scrollTop).toBe(0);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });

  test.describe('custom acceleration', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto('react-sortable-vertical-list--auto-scroll-custom-speed');
      await expect(dnd.items.first()).toBeVisible();
    });

    test('auto-scrolls when dragging near the bottom edge', async ({dnd}) => {
      const first = dnd.items.nth(0);
      const box = await first.boundingBox();
      const viewport = dnd.page.viewportSize()!;

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        viewport.height - 10,
        {steps: 20}
      );

      await expect
        .poll(
          () =>
            dnd.page.evaluate(
              () => document.scrollingElement?.scrollTop ?? 0
            ),
          {timeout: 3_000}
        )
        .toBeGreaterThan(0);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });
});
