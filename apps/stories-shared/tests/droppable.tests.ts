import {test, expect} from './fixtures.ts';

interface DroppableStories {
  example: string;
  multipleDropTargets?: string;
}

export function droppableTests(stories: DroppableStories) {
  test.describe('Droppable', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto(stories.example);
      await expect(dnd.buttons.first()).toBeVisible();
    });

    test('drag item into droppable zone with pointer', async ({dnd}) => {
      const draggable = dnd.buttons.first();
      const dropzone = dnd.dropzones.first();

      await dnd.pointer.drag(draggable, dropzone);
      await dnd.waitForDrop();

      await expect(
        dnd.buttonsIn(dropzone)
      ).toHaveCount(1);
    });

    test('cancel drag with Escape keeps item outside dropzone', async ({dnd}) => {
      const draggable = dnd.buttons.first();
      const dropzone = dnd.dropzones.first();

      const box = await draggable.boundingBox();
      const dzBox = await dropzone.boundingBox();

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(
        dzBox!.x + dzBox!.width / 2,
        dzBox!.y + dzBox!.height / 2,
        {steps: 10}
      );
      await dnd.page.keyboard.press('Escape');
      await dnd.page.mouse.up();
      await dnd.waitForDrop();

      await expect(
        dnd.buttonsIn(dropzone)
      ).toHaveCount(0);
    });
  });

  if (stories.multipleDropTargets) {
    test.describe('Multiple drop targets', () => {
      test.beforeEach(async ({dnd}) => {
        await dnd.goto(stories.multipleDropTargets!);
        await expect(dnd.buttons.first()).toBeVisible();
      });

      test('drag item into second droppable zone', async ({dnd}) => {
        const draggable = dnd.buttons.first();
        const dropzones = dnd.dropzones;

        await dnd.pointer.drag(draggable, dropzones.nth(1));
        await dnd.waitForDrop();

        await expect(
          dnd.buttonsIn(dropzones.nth(1))
        ).toHaveCount(1);
        await expect(
          dnd.buttonsIn(dropzones.nth(0))
        ).toHaveCount(0);
      });

      test('move item between droppable zones', async ({dnd}) => {
        const draggable = dnd.buttons.first();
        const dropzones = dnd.dropzones;

        // Drag into first zone
        await dnd.pointer.drag(draggable, dropzones.nth(0));
        await dnd.waitForDrop();

        await expect(dnd.buttonsIn(dropzones.nth(0))).toHaveCount(1);

        // Move from first zone to third zone
        const movedDraggable = dnd.buttonsIn(dropzones.nth(0)).first();
        await dnd.pointer.drag(movedDraggable, dropzones.nth(2));
        await dnd.waitForDrop();

        await expect(dnd.buttonsIn(dropzones.nth(2))).toHaveCount(1);
        await expect(dnd.buttonsIn(dropzones.nth(0))).toHaveCount(0);
      });
    });
  }
}
