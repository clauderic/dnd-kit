import {sortableVerticalTests} from '../../stories-shared/tests/sortable-vertical.tests.ts';
import {test, expect} from '../../stories-shared/tests/fixtures.ts';

sortableVerticalTests({
  basicSetup: 'react-sortable-vertical-list--basic-setup',
  withDragHandle: 'react-sortable-vertical-list--with-drag-handle',
});

test.describe('Sortable anchor elements', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-vertical-list--anchor-elements');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('drag from anchor descendant content with pointer', async ({dnd}) => {
    const first = dnd.items.nth(0);
    const third = dnd.items.nth(2);

    await expect(first.locator('strong')).toHaveText('Documentation');

    await dnd.pointer.drag(first.locator('strong'), third);
    await dnd.waitForDrop();

    await expect(dnd.items.nth(2).locator('strong')).toHaveText(
      'Documentation'
    );
  });
});
