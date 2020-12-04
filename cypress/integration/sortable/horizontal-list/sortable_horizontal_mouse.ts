/// <reference path="../../../support/index.d.ts" />

describe('Sortable Grid', () => {
  const CELL_WIDTH = 140;
  const CELL_HEIGHT = 140;
  const HORIZONTAL_LIST_STORY = 'presets-sortable-horizontal--basic-setup';

  describe('Move Right', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(CELL_WIDTH, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = CELL_WIDTH * 2;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta * 2);
        });
    });

    it('Does not go past the last index', () => {
      const initialIndex = 15;
      const id = initialIndex.toString();
      const maxIndex = 15;
      const delta = maxIndex + 1;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
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

  describe('Move Left', () => {
    it('Once', () => {
      const initialIndex = 6;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 4;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta * 2);
        });
    });

    it('Does not go below index zero', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const magnitude = CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });

  describe('Moving Verticalle', () => {
    it('Does not move down', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * CELL_HEIGHT;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });

    it('Does not move up', () => {
      const initialIndex = 5;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * CELL_HEIGHT;

      cy.visitStory(HORIZONTAL_LIST_STORY)
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
    it('Multiple allowed actions in both directions', () => {
      const initialIndex = 7;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });

    it('Multiple restricted actions in both directions', () => {
      const initialIndex = 7;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
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

    it('Multiple actions in all directions', () => {
      const initialIndex = 7;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * CELL_WIDTH;

      cy.visitStory(HORIZONTAL_LIST_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'right')
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
});
