import {test, expect} from './fixtures.ts';

interface ModifierStories {
  verticalAxis: string;
  horizontalAxis: string;
  restrictToWindow: string;
  snapToGrid: string;
}

export function modifierTests(stories: ModifierStories) {
  test.describe('Modifiers', () => {
    test.describe('RestrictToVerticalAxis', () => {
      test('restricts drag movement to the vertical axis only', async ({
        dnd,
      }) => {
        await dnd.goto(stories.verticalAxis);
        await dnd.disableTransitions();

        const button = dnd.buttons.first();
        await expect(button).toBeVisible();

        const box = await button.boundingBox();
        if (!box) throw new Error('Could not get bounding box');

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        await dnd.page.mouse.move(startX, startY);
        await dnd.page.mouse.down();
        // Drag diagonally: 200px right, 120px down
        await dnd.page.mouse.move(startX + 200, startY + 120, {steps: 15});
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

        const draggingBox = await dnd.dragging.boundingBox();
        if (!draggingBox) throw new Error('Could not get dragging bounding box');

        const tolerance = 3;
        // X position should not have changed
        expect(Math.abs(draggingBox.x - box.x)).toBeLessThan(tolerance);
        // Y position should have moved down
        expect(draggingBox.y).toBeGreaterThan(box.y + 50);

        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      });
    });

    test.describe('RestrictToHorizontalAxis', () => {
      test('restricts drag movement to the horizontal axis only', async ({
        dnd,
      }) => {
        await dnd.goto(stories.horizontalAxis);
        await dnd.disableTransitions();

        const button = dnd.buttons.first();
        await expect(button).toBeVisible();

        const box = await button.boundingBox();
        if (!box) throw new Error('Could not get bounding box');

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        await dnd.page.mouse.move(startX, startY);
        await dnd.page.mouse.down();
        // Drag diagonally: 200px right, 120px down
        await dnd.page.mouse.move(startX + 200, startY + 120, {steps: 15});
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

        const draggingBox = await dnd.dragging.boundingBox();
        if (!draggingBox) throw new Error('Could not get dragging bounding box');

        const tolerance = 3;
        // Y position should not have changed
        expect(Math.abs(draggingBox.y - box.y)).toBeLessThan(tolerance);
        // X position should have moved right
        expect(draggingBox.x).toBeGreaterThan(box.x + 100);

        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      });
    });

    test.describe('RestrictToWindow', () => {
      test('clamps dragged element within viewport bounds', async ({dnd}) => {
        await dnd.goto(stories.restrictToWindow);
        await dnd.disableTransitions();

        const button = dnd.buttons.first();
        await expect(button).toBeVisible();

        const box = await button.boundingBox();
        if (!box) throw new Error('Could not get bounding box');

        const startX = box.x + box.width / 2;
        const startY = box.y + box.height / 2;

        await dnd.page.mouse.move(startX, startY);
        await dnd.page.mouse.down();
        // Drag far above the viewport
        await dnd.page.mouse.move(startX, startY - 2000, {steps: 20});
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});

        const draggingBox = await dnd.dragging.boundingBox();
        if (!draggingBox) throw new Error('Could not get dragging bounding box');

        // Element must not have left the top of the viewport
        expect(draggingBox.y).toBeGreaterThanOrEqual(-1);

        await dnd.page.mouse.up();
        await dnd.waitForDrop();
      });
    });

    test.describe('SnapModifier', () => {
      test('snaps the drop position to the configured grid size', async ({
        dnd,
      }) => {
        await dnd.goto(stories.snapToGrid);
        await dnd.disableTransitions();

        const button = dnd.buttons.first();
        await expect(button).toBeVisible();

        const initialBox = await button.boundingBox();
        if (!initialBox) throw new Error('Could not get initial bounding box');

        const gridSize = 30;
        // Drag an amount that is not a multiple of gridSize (45px).
        // The snap modifier (ceil) should round up to 60px.
        const dragBy = 45;
        const expectedSnap = Math.ceil(dragBy / gridSize) * gridSize; // 60

        const startX = initialBox.x + initialBox.width / 2;
        const startY = initialBox.y + initialBox.height / 2;

        await dnd.page.mouse.move(startX, startY);
        await dnd.page.mouse.down();
        await dnd.page.mouse.move(startX + dragBy, startY + dragBy, {
          steps: 10,
        });
        await expect(dnd.dragging).toHaveCount(1, {timeout: 3_000});
        await dnd.page.mouse.up();
        await dnd.waitForDrop();

        const finalBox = await button.boundingBox();
        if (!finalBox) throw new Error('Could not get final bounding box');

        const tolerance = 2;
        expect(
          Math.abs(finalBox.x - initialBox.x - expectedSnap)
        ).toBeLessThan(tolerance);
        expect(
          Math.abs(finalBox.y - initialBox.y - expectedSnap)
        ).toBeLessThan(tolerance);
      });
    });
  });
}
