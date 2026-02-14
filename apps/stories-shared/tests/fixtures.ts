import {test as base, expect, type Page, type Locator} from '@playwright/test';

export {expect};

interface DndFixture {
  page: Page;
  buttons: Locator;
  buttonsIn(parent: Locator): Locator;
  items: Locator;
  dragging: Locator;
  placeholder: Locator;
  dropzones: Locator;
  handles: Locator;
  rows: Locator;
  columns: Locator;
  goto(storyId: string): Promise<void>;
  disableTransitions(): Promise<void>;
  pointer: PointerActions;
  keyboard: KeyboardActions;
  waitForDrop(): Promise<void>;
}

interface PointerActions {
  drag(
    source: Locator,
    target: Locator,
    options?: {steps?: number}
  ): Promise<void>;
}

interface KeyboardActions {
  pickup(source: Locator): Promise<void>;
  move(
    direction: 'up' | 'down' | 'left' | 'right',
    times?: number
  ): Promise<void>;
  drop(): Promise<void>;
  cancel(): Promise<void>;
}

export const test = base.extend<{dnd: DndFixture}>({
  dnd: async ({page}, use) => {
    const root = page.locator('#storybook-root');
    const buttons = root.locator('.btn');
    const items = root.locator('.Item, .item');
    const dragging = page.locator('[data-dnd-dragging]');
    const placeholder = page.locator('[data-dnd-placeholder]');
    const dropzones = root.locator('.droppable');
    const handles = root.locator('.handle');
    const rows = root.locator('tbody tr');
    const columns = root.locator('thead th');

    const pointer: PointerActions = {
      async drag(source, target, options) {
        const steps = options?.steps ?? 20;
        const sourceBox = await source.boundingBox();
        const targetBox = await target.boundingBox();

        if (!sourceBox || !targetBox) {
          throw new Error('Could not get bounding box for source or target');
        }

        const sx = sourceBox.x + sourceBox.width / 2;
        const sy = sourceBox.y + sourceBox.height / 2;
        const tx = targetBox.x + targetBox.width / 2;
        const ty = targetBox.y + targetBox.height / 2;

        await page.mouse.move(sx, sy);
        await page.mouse.down();
        await page.mouse.move(tx, ty, {steps});
        await expect(dragging).toHaveCount(1, {timeout: 3_000});
        await page.mouse.up();
      },
    };

    const keyboard: KeyboardActions = {
      async pickup(source) {
        await source.focus();
        await page.keyboard.press('Space');
        await expect(dragging).toHaveCount(1, {timeout: 3_000});
      },
      async move(direction, times = 1) {
        const key =
          direction === 'up'
            ? 'ArrowUp'
            : direction === 'down'
              ? 'ArrowDown'
              : direction === 'left'
                ? 'ArrowLeft'
                : 'ArrowRight';

        for (let i = 0; i < times; i++) {
          await page.keyboard.press(key);
          await page.waitForTimeout(30);
        }
      },
      async drop() {
        await page.keyboard.press('Space');
      },
      async cancel() {
        await page.keyboard.press('Escape');
      },
    };

    const dnd: DndFixture = {
      page,
      buttons,
      buttonsIn(parent: Locator) {
        return parent.locator('.btn');
      },
      items,
      dragging,
      placeholder,
      dropzones,
      handles,
      rows,
      columns,

      async goto(storyId: string) {
        await page.goto(
          `/iframe.html?id=${storyId}&viewMode=story`
        );
        await page.waitForLoadState('domcontentloaded');
      },

      async disableTransitions() {
        await page.addStyleTag({
          content:
            '*, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }',
        });
      },

      pointer,
      keyboard,

      async waitForDrop() {
        await expect(dragging).toHaveCount(0, {timeout: 5_000});
      },
    };

    await use(dnd);
  },
});

expect.extend({
  async toHaveOrder(locator: Locator, expected: string[]) {
    const assertionName = 'toHaveOrder';
    let actual: string[];
    let pass: boolean;

    try {
      await expect(async () => {
        actual = await locator.allTextContents();
        actual = actual.map((t) => t.trim());
        expect(actual).toEqual(expected);
      }).toPass({timeout: 5_000});
      pass = true;
    } catch {
      actual = await locator.allTextContents();
      actual = actual.map((t) => t.trim());
      pass = false;
    }

    return {
      message: () =>
        pass
          ? `expected items NOT to have order ${JSON.stringify(expected)}`
          : `expected items to have order ${JSON.stringify(expected)}, but got ${JSON.stringify(actual!)}`,
      pass,
      name: assertionName,
      expected,
      actual: actual!,
    };
  },

  async toBeDragging(locator: Locator) {
    const assertionName = 'toBeDragging';
    let pass: boolean;

    try {
      await expect(locator).toHaveAttribute('data-dnd-dragging', 'true', {
        timeout: 3_000,
      });
      pass = true;
    } catch {
      pass = false;
    }

    return {
      message: () =>
        pass
          ? 'expected element NOT to be dragging'
          : 'expected element to be dragging (have [data-dnd-dragging] attribute)',
      pass,
      name: assertionName,
    };
  },

  async toBeDropTarget(locator: Locator) {
    const assertionName = 'toBeDropTarget';
    let pass: boolean;

    try {
      await expect(locator).toHaveClass(/active/, {
        timeout: 3_000,
      });
      pass = true;
    } catch {
      pass = false;
    }

    return {
      message: () =>
        pass
          ? 'expected element NOT to be a drop target'
          : 'expected element to be a drop target (have "active" class)',
      pass,
      name: assertionName,
    };
  },
});

declare module '@playwright/test' {
  interface Matchers<R, T> {
    toHaveOrder(expected: string[]): R;
    toBeDragging(): R;
    toBeDropTarget(): R;
  }
}
