/// <reference path="../../../support/index.d.ts" />

describe('Sortable Vertical List', () => {
  const VERTICAL_LIST_STORY = 'presets-sortable-vertical--basic-setup';
  const VERTICAL_CELL_HEIGHT = 80;

  describe('Move Down', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta * 2);
        });
    });

    it('Does not go past the last index', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const maxIndex = 49;
      const delta = maxIndex + 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(maxIndex);
        });
    });
  });

  describe('Move Up', () => {
    it('Once', () => {
      const initialIndex = 5;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        });
    });

    it('Does not go below index zero', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });

  describe('Stress test', () => {
    it('Multiple actions in both directions', () => {
      const initialIndex = 5;
      const id = initialIndex.toString();
      const delta = 4;
      const magnitude = (delta - 1) * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VERTICAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .wait(1000)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });
});
