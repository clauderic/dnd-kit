import {test, expect} from './fixtures.ts';

test.describe('Sortable iframe', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-iframe--iframe');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('reorder items within host list with pointer', async ({dnd}) => {
    const hostItems = dnd.items.filter({hasText: /^Host:/});
    const first = hostItems.nth(0);
    const third = hostItems.nth(2);

    const firstText = await first.textContent();

    await dnd.pointer.drag(first, third);
    await dnd.waitForDrop();

    const newFirst = await hostItems.nth(0).textContent();
    expect(newFirst).not.toBe(firstText);
  });

  test('move item from host to iframe list with pointer', async ({dnd}) => {
    const hostItems = dnd.items.filter({hasText: /^Host:/});
    const hostCount = await hostItems.count();

    // The iframe column is to the right of the host column
    const iframe = dnd.page.locator('#storybook-root iframe');
    const iframeBox = await iframe.boundingBox();
    const firstHost = hostItems.nth(0);
    const box = await firstHost.boundingBox();

    await dnd.page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2
    );
    await dnd.page.mouse.down();

    // Drag into the iframe area
    await dnd.page.mouse.move(
      iframeBox!.x + iframeBox!.width / 2,
      iframeBox!.y + 100,
      {steps: 30}
    );
    await dnd.page.mouse.up();
    await dnd.waitForDrop();

    const newHostCount = await hostItems.count();
    expect(newHostCount).toBe(hostCount - 1);
  });
});

test.describe('Sortable transformed iframe', () => {
  test.beforeEach(async ({dnd}) => {
    await dnd.goto('react-sortable-iframe--iframe-transformed');
    await expect(dnd.items.first()).toBeVisible();
  });

  test('drag works in host list despite transformed iframe', async ({dnd}) => {
    const hostItems = dnd.items.filter({hasText: /^Host:/});
    const first = hostItems.nth(0);
    const third = hostItems.nth(2);

    const firstText = await first.textContent();

    await dnd.pointer.drag(first, third);
    await dnd.waitForDrop();

    const newFirst = await hostItems.nth(0).textContent();
    expect(newFirst).not.toBe(firstText);
  });

  test('move item from host to transformed iframe with pointer', async ({
    dnd,
  }) => {
    const hostItems = dnd.items.filter({hasText: /^Host:/});
    const hostCount = await hostItems.count();

    const iframe = dnd.page.locator('#storybook-root iframe');
    const iframeBox = await iframe.boundingBox();
    const firstHost = hostItems.nth(0);
    const box = await firstHost.boundingBox();

    await dnd.page.mouse.move(
      box!.x + box!.width / 2,
      box!.y + box!.height / 2
    );
    await dnd.page.mouse.down();

    await dnd.page.mouse.move(
      iframeBox!.x + iframeBox!.width / 2,
      iframeBox!.y + 100,
      {steps: 30}
    );
    await dnd.page.mouse.up();
    await dnd.waitForDrop();

    const newHostCount = await hostItems.count();
    expect(newHostCount).toBe(hostCount - 1);
  });
});
