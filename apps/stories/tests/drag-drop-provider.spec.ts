import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('DragDropProvider', () => {
  test('cleans up without React errors', async ({dnd}) => {
    const errors: string[] = [];

    dnd.page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    dnd.page.on('pageerror', (error) => errors.push(error.message));

    await dnd.goto('react-dragdropprovider--cleanup');
    await expect(
      dnd.page.getByRole('button', {name: 'Unmount provider'})
    ).toBeVisible();

    await dnd.keyboard.pickup(
      dnd.page.getByRole('button', {name: 'Draggable'})
    );
    await dnd.keyboard.cancel();

    await dnd.page.getByRole('button', {name: 'Unmount provider'}).click();
    await expect(dnd.page.getByText('Provider unmounted')).toBeVisible();
    await dnd.page.waitForTimeout(0);

    expect(errors).toEqual([]);
  });
});
