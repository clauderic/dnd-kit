/// <reference path="../../../support/index.d.ts" />

describe('Sortable Vertical List', () => {
  describe('Move Down', () => {
    it.only('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 2;

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
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

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
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

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        });
    });

    it('Does not go below index zero', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(1, 'up')
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

      cy.visitStory('presets-sortable-vertical--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });
});
