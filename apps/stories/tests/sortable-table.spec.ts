import {test, expect} from '../../stories-shared/tests/fixtures.ts';

test.describe('Sortable table', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-table--example');
    // Wait for actual table data to render (not Storybook docs content)
    await expect(dnd.page.locator('#storybook-root td', {hasText: 'Alice Johnson'})).toBeVisible();
  });

  test('reorder rows with pointer via drag handle', async ({dnd}) => {
    const firstHandle = dnd.handles.nth(0);
    const thirdHandle = dnd.handles.nth(2);

    const getRowName = (index: number) =>
      dnd.rows.nth(index).locator('td').nth(1);

    const firstName = await getRowName(0).textContent();

    await dnd.pointer.drag(firstHandle, thirdHandle);
    await dnd.waitForDrop();

    const newFirstName = await getRowName(0).textContent();
    expect(newFirstName).not.toBe(firstName);
  });

  test('reorder columns with pointer', async ({dnd}) => {
    const headerCells = dnd.page.locator('#storybook-root thead th');
    const secondCol = headerCells.nth(1);
    const fourthCol = headerCells.nth(3);

    const originalHeader = await secondCol.textContent();

    await dnd.pointer.drag(secondCol, fourthCol);
    await dnd.waitForDrop();

    const newHeader = await headerCells.nth(1).textContent();
    expect(newHeader).not.toBe(originalHeader);
  });

  test('cell widths are preserved after row drag', async ({dnd}) => {
    const firstHandle = dnd.handles.nth(0);
    const secondHandle = dnd.handles.nth(1);

    const getCellWidths = async () => {
      const cells = dnd.rows.nth(0).locator('td');
      const count = await cells.count();
      const widths: number[] = [];
      for (let i = 0; i < count; i++) {
        const box = await cells.nth(i).boundingBox();
        widths.push(Math.round(box!.width));
      }
      return widths;
    };

    const widthsBefore = await getCellWidths();

    await dnd.pointer.drag(firstHandle, secondHandle);
    await dnd.waitForDrop();

    const widthsAfter = await getCellWidths();

    for (let i = 0; i < widthsBefore.length; i++) {
      expect(widthsAfter[i]).toBeCloseTo(widthsBefore[i], -1);
    }
  });
});
