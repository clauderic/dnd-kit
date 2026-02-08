import {test, expect} from './fixtures.ts';

test.describe('Droppable', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-droppable--example');
    await expect(dnd.page.locator('#storybook-root button-component')).toBeVisible();
  });

  test('drag item into droppable zone with pointer', async ({dnd}) => {
    const draggable = dnd.page.locator('#storybook-root button-component');
    const dropzone = dnd.dropzones.first();

    await dnd.pointer.drag(draggable, dropzone);
    await dnd.waitForDrop();

    await expect(dropzone.locator('button-component')).toHaveCount(1);
  });

  test('cancel drag with Escape keeps item outside dropzone', async ({dnd}) => {
    const draggable = dnd.page.locator('#storybook-root button-component');
    const dropzone = dnd.dropzones.first();

    const box = await draggable.boundingBox();
    const dzBox = await dropzone.boundingBox();

    await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await dnd.page.mouse.down();
    await dnd.page.mouse.move(
      dzBox!.x + dzBox!.width / 2,
      dzBox!.y + dzBox!.height / 2,
      {steps: 10}
    );
    await dnd.page.keyboard.press('Escape');
    await dnd.page.mouse.up();
    await dnd.waitForDrop();

    await expect(dropzone.locator('button-component')).toHaveCount(0);
  });
});

test.describe('Multiple drop targets', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-droppable-multiple-drop-targets--example');
    await expect(dnd.page.locator('#storybook-root button-component')).toBeVisible();
  });

  test('drag item into second droppable zone', async ({dnd}) => {
    const draggable = dnd.page.locator('#storybook-root button-component');
    const dropzones = dnd.dropzones;

    await dnd.pointer.drag(draggable, dropzones.nth(1));
    await dnd.waitForDrop();

    await expect(dropzones.nth(1).locator('button-component')).toHaveCount(1);
    await expect(dropzones.nth(0).locator('button-component')).toHaveCount(0);
  });
});
