import {test, expect} from './fixtures.ts';

interface SortableBorderSpacingStories {
  table: string;
}

interface ContentOffset {
  x: number;
  y: number;
}

function getContentOffset(element: Element): ContentOffset {
  const box = element.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(element);
  const content = range.getBoundingClientRect();

  return {x: content.x - box.x, y: content.y - box.y};
}

export function sortableBorderSpacingTests(
  stories: SortableBorderSpacingStories
) {
  // Tolerance for rounding and sub-pixel differences
  const tolerance = 3;

  test.describe('Sortable table with border-spacing', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto(stories.table);
      // Wait for actual table data to render (not Storybook docs content)
      await expect(
        dnd.page.locator('#storybook-root td', {hasText: 'Alice Johnson'})
      ).toBeVisible();
    });

    test('dragged row stays aligned with its pre-drag position', async ({
      dnd,
    }) => {
      const row = dnd.rows.nth(0);
      const cell = row.locator('td').nth(0);

      const rowBox = await row.boundingBox();
      const cellBox = await cell.boundingBox();
      if (!rowBox || !cellBox) {
        throw new Error('Could not get bounding boxes');
      }

      // Offset of the first cell relative to the row's border box before drag
      const cellOffsetX = cellBox.x - rowBox.x;
      const cellOffsetY = cellBox.y - rowBox.y;

      const handleBox = await dnd.handles.nth(0).boundingBox();
      if (!handleBox) throw new Error('Could not get handle bounding box');

      const pointerX = handleBox.x + handleBox.width / 2;
      const pointerY = handleBox.y + handleBox.height / 2;

      await dnd.page.mouse.move(pointerX, pointerY);
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(pointerX + 20, pointerY + 60, {steps: 15});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      const draggingBox = await dnd.dragging.boundingBox();
      const draggedCellBox = await dnd.dragging
        .locator('td')
        .nth(0)
        .boundingBox();
      if (!draggingBox || !draggedCellBox) {
        throw new Error('Could not get dragging bounding boxes');
      }

      expect(
        Math.abs(draggedCellBox.x - draggingBox.x - cellOffsetX)
      ).toBeLessThan(tolerance);
      expect(
        Math.abs(draggedCellBox.y - draggingBox.y - cellOffsetY)
      ).toBeLessThan(tolerance);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('dragged column header stays aligned with its pre-drag position', async ({
      dnd,
    }) => {
      const header = dnd.columns.nth(1);
      await expect(header).toBeVisible();

      const headerBox = await header.boundingBox();
      if (!headerBox) throw new Error('Could not get bounding box');

      // Offset of the header contents relative to its border box before drag
      const initialOffset = await header.evaluate(getContentOffset);

      const pointerX = headerBox.x + headerBox.width / 2;
      const pointerY = headerBox.y + headerBox.height / 2;

      await dnd.page.mouse.move(pointerX, pointerY);
      await dnd.page.mouse.down();
      // Column sorting is restricted to the horizontal axis
      await dnd.page.mouse.move(pointerX + 60, pointerY, {steps: 15});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      const draggedOffset = await dnd.dragging.evaluate(getContentOffset);

      expect(Math.abs(draggedOffset.x - initialOffset.x)).toBeLessThan(
        tolerance
      );
      expect(Math.abs(draggedOffset.y - initialOffset.y)).toBeLessThan(
        tolerance
      );

      const draggingBox = await dnd.dragging.boundingBox();
      if (!draggingBox) throw new Error('Could not get dragging bounding box');

      // The header cell should stay under the pointer it was grabbed from
      // (its center)
      const centerX = draggingBox.x + draggingBox.width / 2;
      expect(Math.abs(pointerX + 60 - centerX)).toBeLessThan(tolerance);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });
}
