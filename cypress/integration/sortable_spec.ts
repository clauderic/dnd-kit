/// <reference path="../support/index.d.ts" />

function getIdForIndex(index: number) {
  return `${index + 1}`;
}

describe('Sortable Grid', () => {
  describe('Move Right', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const delta = 2;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + delta * 2);
        });
    });

    it('Does not go past the last index', () => {
      const initialIndex = 15;
      const id = getIdForIndex(initialIndex);
      const maxIndex = 15;
      const delta = maxIndex + 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
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

  describe('Move Down', () => {
    const numberOfItemsPerRow = 5;

    it('Once', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow - 1 + delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow - 1 + delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'down')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex + numberOfItemsPerRow * 2 - 1 + delta);
        });
    });

    it('Does not go past the last index', () => {
      const initialIndex = 15;
      const id = getIdForIndex(initialIndex);
      const maxIndex = 15;
      const delta = maxIndex + 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
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
    const numberOfItemsPerRow = 5;

    it('Once', () => {
      const initialIndex = 5;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - (numberOfItemsPerRow - 1) - delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 15;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - (numberOfItemsPerRow - 1) - delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(
            initialIndex - (numberOfItemsPerRow * 2 - 1) - delta
          );
        });
    });

    it('Does not go past the first index', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const minIndex = 0;
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(minIndex);
        });
    });
  });

  describe('Move Left', () => {
    it('Once', () => {
      const initialIndex = 6;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        });
    });

    it('Two consecutive sort actions', () => {
      const initialIndex = 4;
      const id = getIdForIndex(initialIndex);
      const delta = 2;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta * 2);
        });
    });

    it('Does not go below index zero', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(1, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });

  describe('Stress test', () => {
    it('Multiple actions in both directions', () => {
      const initialIndex = 7;
      const id = getIdForIndex(initialIndex);
      const delta = 2;

      cy.visitStory('presets-sortable-grid--basic-setup')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'left')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex - delta);
        })
        .findItemById(id)
        .keyboardMoveBy(delta, 'right')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });
});

describe('Sortable Vertical List', () => {
  describe('Move Down', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
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
      const id = getIdForIndex(initialIndex);
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
      const id = getIdForIndex(initialIndex);
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
      const id = getIdForIndex(initialIndex);
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
      const id = getIdForIndex(initialIndex);

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
      const id = getIdForIndex(initialIndex);
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

describe('Sortable Virtualized List', () => {
  describe('Move Down', () => {
    it('Once', () => {
      const initialIndex = 0;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
      const id = getIdForIndex(initialIndex);
      const delta = 2;

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
      const id = getIdForIndex(initialIndex);
      const maxIndex = 99;
      const delta = maxIndex + 1;

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
      const initialIndex = 1;
      const id = getIdForIndex(initialIndex);
      const delta = 1;

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
      const id = getIdForIndex(initialIndex);

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
      const initialIndex = 10;
      const id = getIdForIndex(initialIndex);
      const delta = 10;

      cy.visitStory('presets-sortable-virtualized--basic-setup')
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
        .keyboardMoveBy(delta, 'up')
        .getIndexForItem(id)
        .then((index) => {
          expect(index).eq(initialIndex);
        });
    });
  });
});
