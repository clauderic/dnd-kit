import {test, expect} from './fixtures.ts';

interface DraggableStories {
  example: string;
  dragHandle: string;
}

export function draggableTests(stories: DraggableStories) {
  test.describe('Draggable', () => {
    test.beforeEach(async ({dnd}) => {
      await dnd.goto(stories.example);
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

      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + 100, {
        steps: 10,
      });

      await expect(dnd.dragging).toHaveCount(1);

      await dnd.page.mouse.up();
      await dnd.waitForDrop();
    });

    test('keeps feedback styles mounted between drags', async ({dnd}) => {
      const button = dnd.buttons.first();
      const feedbackStyles = () =>
        dnd.page.evaluate(() => {
          const styles = Array.from(document.querySelectorAll('style')).filter(
            (style) => style.textContent?.includes('[data-dnd-dragging]')
          );

          return {
            count: styles.length,
            retained: styles.filter((style) =>
              style.hasAttribute('data-test-retained')
            ).length,
          };
        });

      await dnd.pointer.drag(button, button);
      await dnd.waitForDrop();

      await expect.poll(feedbackStyles).toEqual({count: 1, retained: 0});
      await dnd.page.evaluate(() => {
        Array.from(document.querySelectorAll('style'))
          .find((style) => style.textContent?.includes('[data-dnd-dragging]'))
          ?.setAttribute('data-test-retained', '');
      });

      const box = await button.boundingBox();
      await dnd.page.mouse.move(
        box!.x + box!.width / 2,
        box!.y + box!.height / 2
      );
      await dnd.page.mouse.down();
      await dnd.page.mouse.move(box!.x + box!.width / 2, box!.y + 100, {
        steps: 10,
      });
      await expect(dnd.dragging).toHaveCount(1);

      // Re-inserting the stylesheet would create a new element without the marker.
      await expect.poll(feedbackStyles).toEqual({count: 1, retained: 1});

      await dnd.page.mouse.up();
      await dnd.waitForDrop();

      await expect.poll(feedbackStyles).toEqual({count: 1, retained: 1});
    });
  });

  test.describe('Draggable with drag handle', () => {
    test('can be dragged using the handle with keyboard', async ({dnd}) => {
      await dnd.goto(stories.dragHandle);
      const handle = dnd.handles.first();
      await expect(handle).toBeVisible({timeout: 10_000});

      await dnd.keyboard.pickup(handle);
      await expect(dnd.dragging).toHaveCount(1);
      await dnd.keyboard.drop();
      await dnd.waitForDrop();
    });
  });
}
