import {test, expect} from './fixtures.ts';

interface DragOffsetStories {
  draggable: string;
  sortableVertical: string;
}

export function dragOffsetTests(stories: DragOffsetStories) {
  test.describe('Drag offset', () => {
    test('dragged element follows pointer with no unexpected offset (draggable)', async ({
      dnd,
    }) => {
      await dnd.goto(stories.draggable);
      const button = dnd.buttons.first();
      await expect(button).toBeVisible();

      const box = await button.boundingBox();
      if (!box) throw new Error('Could not get bounding box');

      // Click at a known offset within the element (1/4 from top-left)
      const clickX = box.x + box.width * 0.25;
      const clickY = box.y + box.height * 0.25;

      await dnd.page.mouse.move(clickX, clickY);
      await dnd.page.mouse.down();

      // Move enough to trigger drag activation
      const dragTargetX = clickX + 0;
      const dragTargetY = clickY + 80;

      await dnd.page.mouse.move(dragTargetX, dragTargetY, {steps: 15});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      // Read the dragging element's bounding box
      const draggingBox = await dnd.dragging.boundingBox();
      if (!draggingBox) throw new Error('Could not get dragging bounding box');

      // The cursor should be at approximately the same relative position
      // within the dragged element as where we originally clicked.
      // Original click was at 25% from the left and 25% from the top.
      const cursorRelativeX = dragTargetX - draggingBox.x;
      const cursorRelativeY = dragTargetY - draggingBox.y;

      const expectedRelativeX = box.width * 0.25;
      const expectedRelativeY = box.height * 0.25;

      // Allow a tolerance of 3px for rounding and sub-pixel differences
      const tolerance = 3;

      expect(cursorRelativeX).toBeGreaterThan(expectedRelativeX - tolerance);
      expect(cursorRelativeX).toBeLessThan(expectedRelativeX + tolerance);
      expect(cursorRelativeY).toBeGreaterThan(expectedRelativeY - tolerance);
      expect(cursorRelativeY).toBeLessThan(expectedRelativeY + tolerance);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('dragged sortable element tracks pointer movement accurately', async ({
      dnd,
    }) => {
      await dnd.goto(stories.sortableVertical);
      const item = dnd.items.first();
      await expect(item).toBeVisible();

      const box = await item.boundingBox();
      if (!box) throw new Error('Could not get bounding box');

      // Click at the center of the first item
      const clickX = box.x + box.width * 0.5;
      const clickY = box.y + box.height * 0.5;

      await dnd.page.mouse.move(clickX, clickY);
      await dnd.page.mouse.down();

      // Move down to trigger drag
      const firstMoveX = clickX;
      const firstMoveY = clickY + 60;
      await dnd.page.mouse.move(firstMoveX, firstMoveY, {steps: 15});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      // Record the initial offset between cursor and dragging element.
      // This accounts for any scale transforms applied on drag start.
      const initialBox = await dnd.dragging.boundingBox();
      if (!initialBox) throw new Error('Could not get dragging bounding box');

      const initialOffsetX = firstMoveX - initialBox.x;
      const initialOffsetY = firstMoveY - initialBox.y;

      // Move to a new position and verify the offset stays the same
      const secondMoveX = clickX + 30;
      const secondMoveY = clickY + 120;
      await dnd.page.mouse.move(secondMoveX, secondMoveY, {steps: 10});
      await dnd.page.waitForTimeout(50);

      const movedBox = await dnd.dragging.boundingBox();
      if (!movedBox) throw new Error('Could not get dragging bounding box');

      const movedOffsetX = secondMoveX - movedBox.x;
      const movedOffsetY = secondMoveY - movedBox.y;

      const tolerance = 3;
      expect(Math.abs(movedOffsetX - initialOffsetX)).toBeLessThan(tolerance);
      expect(Math.abs(movedOffsetY - initialOffsetY)).toBeLessThan(tolerance);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('dragged element tracks pointer movement accurately', async ({
      dnd,
    }) => {
      await dnd.goto(stories.draggable);
      const button = dnd.buttons.first();
      await expect(button).toBeVisible();

      const box = await button.boundingBox();
      if (!box) throw new Error('Could not get bounding box');

      const clickX = box.x + box.width / 2;
      const clickY = box.y + box.height / 2;

      await dnd.page.mouse.move(clickX, clickY);
      await dnd.page.mouse.down();

      // Move to trigger drag activation
      await dnd.page.mouse.move(clickX, clickY + 50, {steps: 10});
      await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

      // Now move to several positions and check the element tracks the cursor
      const positions = [
        {x: clickX + 100, y: clickY + 100},
        {x: clickX - 50, y: clickY + 200},
        {x: clickX + 150, y: clickY - 30},
      ];

      for (const pos of positions) {
        await dnd.page.mouse.move(pos.x, pos.y, {steps: 5});
        // Small wait for the position to update
        await dnd.page.waitForTimeout(50);

        const draggingBox = await dnd.dragging.boundingBox();
        if (!draggingBox)
          throw new Error('Could not get dragging bounding box');

        // The cursor should be at the center of the dragged element
        // (since we started the drag from the center)
        const centerX = draggingBox.x + draggingBox.width / 2;
        const centerY = draggingBox.y + draggingBox.height / 2;

        const tolerance = 5;
        expect(Math.abs(pos.x - centerX)).toBeLessThan(tolerance);
        expect(Math.abs(pos.y - centerY)).toBeLessThan(tolerance);
      }

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });
  });
}
