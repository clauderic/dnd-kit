import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Droppable', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('droppable-basic-setup--example');
    await expect(dnd.buttons.first()).toBeVisible();
  });

  test('drag item into droppable zone with pointer', async ({dnd}) => {
    const draggable = dnd.buttons.first();
    const dropzone = dnd.dropzones.first();

    await dnd.pointer.drag(draggable, dropzone);
    await dnd.waitForDrop();

    await expect(dropzone.locator('button-component, .btn')).toHaveCount(1);
  });
});
