/// <reference path="../../../support/index.d.ts" />

describe('Sortable Virtualized List', () => {
  const VIRTUALIZED_LIST_STORY = 'presets-sortable-virtualized--basic-setup';
  const VERTICAL_CELL_HEIGHT = 80;

  describe('Move Down', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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

    it.skip('Does not go past the last index', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const maxIndex = 99;
      const delta = maxIndex + 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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
      const initialIndex = 1;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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
    it.skip('Multiple actions in both directions', () => {
      const initialIndex = 10;
      const id = initialIndex.toString();
      const delta = 10;
      const magnitude = delta * VERTICAL_CELL_HEIGHT;

      cy.visitStory(VIRTUALIZED_LIST_STORY)
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
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });
});
