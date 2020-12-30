/// <reference path="../support/index.d.ts" />

describe('Draggable', () => {
  describe('Basic setup', () => {
    it('Move item', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--basic-setup')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(-deltaX * 2, -deltaY * 2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(-deltaX * 2);
          expect(delta.y).eq(-deltaY * 2);

          return subject;
        });
    });
  });

  describe('Drag handle', () => {
    it('Does nothing when clicking on the item rather than the handle', () => {
      cy.visitStory('core-draggable-hooks-usedraggable--drag-handle')
        .findFirstDraggableItem()
        .mouseMoveBy(100, 100)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });

    it('Moves when clicking on the handle', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--drag-handle')
        .findFirstDraggableItem()
        .findDraggableHandle()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(-deltaX * 2, -deltaY * 2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(-deltaX * 2);
          expect(delta.y).eq(-deltaY * 2);

          return subject;
        });
    });
  });

  describe('Horizontal', () => {
    it('Only moves horizontally', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--horizontal-axis')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(0);

          return subject;
        })
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(0);

          return subject;
        })
        .mouseMoveBy(-deltaX * 2, -deltaY * 2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(-deltaX * 2);
          expect(delta.y).eq(0);

          return subject;
        });
    });
  });

  describe('Vertical', () => {
    it('Only moves vertically', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--vertical-axis')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(-deltaX * 2, -deltaY * 2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(-deltaY * 2);

          return subject;
        });
    });
  });

  describe('Press delay', () => {
    it('Activates after the press delay duration', () => {
      const deltaX = 100;
      const deltaY = 150;
      const delay = 250;

      cy.visitStory('core-draggable-hooks-usedraggable--press-delay')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY, {delay})
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(deltaX, deltaY, {delay})
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        })
        .mouseMoveBy(-deltaX * 2, -deltaY * 2, {delay})
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(-deltaX * 2);
          expect(delta.y).eq(-deltaY * 2);

          return subject;
        });
    });

    it('Does not activate if the mouse is moved before the press delay duration', () => {
      const deltaX = 100;
      const deltaY = 150;
      const delay = 100;

      cy.visitStory('core-draggable-hooks-usedraggable--press-delay')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY, {delay})
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });
  });
  describe('Minimum distance', () => {
    it('Activates if the mouse is moved more than the minimum distance', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        });
    });

    it('Does not activate if the mouse is moved less than the minimum distance', () => {
      const deltaX = 5;
      const deltaY = 5;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });
  });
});
