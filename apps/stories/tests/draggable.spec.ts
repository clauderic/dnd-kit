import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Draggable', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-draggable--example');
    await expect(dnd.buttons.first()).toBeVisible();
  });

  test('can be picked up and dropped with pointer', async ({dnd}) => {
    const button = dnd.buttons.first();

    const box = await button.boundingBox();
    await dnd.pointer.drag(button, button);
    await dnd.waitForDrop();

    const boxAfter = await button.boundingBox();
    expect(boxAfter!.x).toBeCloseTo(box!.x, -1);
    expect(boxAfter!.y).toBeCloseTo(box!.y, -1);
  });

  test('shows dragging state during pointer drag', async ({dnd}) => {
    const button = dnd.buttons.first();
    const box = await button.boundingBox();

    await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await dnd.page.mouse.down();
    await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + 100, {steps: 10});

    await expect(dnd.dragging).toHaveCount(1);

    await dnd.page.mouse.up();
    await dnd.waitForDrop();
  });
});

test.describe('Draggable with drag handle', () => {
  test('can be dragged using the handle with keyboard', async ({dnd}) => {
    await dnd.goto('react-draggable-drag-handles--drag-handle');
    const handle = dnd.handles.first();
    await expect(handle).toBeVisible({timeout: 10_000});

    await dnd.keyboard.pickup(handle);
    await expect(dnd.dragging).toHaveCount(1);
    await dnd.keyboard.drop();
    await dnd.waitForDrop();
  });
});
