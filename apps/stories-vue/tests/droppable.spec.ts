import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Droppable', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('droppable-basic-setup--example');
    await expect(dnd.page.locator('#storybook-root button-component')).toBeVisible();
  });

  test('drag item into droppable zone with pointer', async ({dnd}) => {
    const draggable = dnd.page.locator('#storybook-root button-component');
    const dropzone = dnd.dropzones.first();

    await dnd.pointer.drag(draggable, dropzone);
    await dnd.waitForDrop();

    await expect(dropzone.locator('button-component')).toHaveCount(1);
  });
});
