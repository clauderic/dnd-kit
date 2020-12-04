/// <reference path="../../../support/index.d.ts" />

describe('Sortable Grid', () => {
  const GRID_CELL_WIDTH = 140;
  const GRID_CELL_HEIGHT = 140;
  const GRID_STORY = 'presets-sortable-grid--basic-setup';

  describe('Move Right', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(GRID_CELL_WIDTH, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = GRID_CELL_WIDTH * 2;

      cy.visitStory(GRID_STORY)
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
      const magnitude = delta * GRID_CELL_WIDTH;

      cy.visitStory(GRID_STORY)
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

  describe('Move Down', () => {
    const numberOfItemsPerRow = 5;

    it('Once', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow - 1 + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow - 1 + delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow * 2 - 1 + delta);
        });
    });

    it('Does not go past the last index', () => {
      const initialIndex = 15;
      const id = initialIndex.toString();
      const maxIndex = 15;
      const delta = maxIndex + 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
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
    const numberOfItemsPerRow = 5;

    it('Once', () => {
      const initialIndex = 5;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - (numberOfItemsPerRow - 1) - delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 15;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - (numberOfItemsPerRow - 1) - delta);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(
            initialIndex - (numberOfItemsPerRow * 2 - 1) - delta
          );
        });
    });

    it('Does not go past the first index', () => {
      const initialIndex = 0;
      const id = initialIndex.toString();
      const minIndex = 0;
      const delta = 1;
      const magnitude = delta * GRID_CELL_HEIGHT;

      cy.visitStory(GRID_STORY)
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .mouseMoveInDirection(magnitude, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(minIndex);
        });
    });
  });

  describe('Move Left', () => {
    it('Once', () => {
      const initialIndex = 6;
      const id = initialIndex.toString();
      const delta = 1;
      const magnitude = delta * GRID_CELL_WIDTH;

      cy.visitStory(GRID_STORY)
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
      const magnitude = delta * GRID_CELL_WIDTH;

      cy.visitStory(GRID_STORY)
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
      const magnitude = GRID_CELL_WIDTH;

      cy.visitStory(GRID_STORY)
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

  describe('Stress test', () => {
    it('Multiple actions in both directions', () => {
      const initialIndex = 7;
      const id = initialIndex.toString();
      const delta = 2;
      const magnitude = delta * GRID_CELL_WIDTH;

      cy.visitStory(GRID_STORY)
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
  });
});
