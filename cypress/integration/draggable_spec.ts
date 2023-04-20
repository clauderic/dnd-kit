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

    it('Activates after unsuccessful first drag attempt once the press delay duration is met', () => {
      const deltaX = 100;
      const deltaY = 150;
      const delay = 250;

      cy.visitStory('core-draggable-hooks-usedraggable--press-delay')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY, {delay: delay / 2})
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        })
        .wait(delay)
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

    it('Activates if the mouse is moved more than the minimum distance in the x axis', () => {
      const deltaX1 = 100;
      const deltaY1 = 5;
      const deltaX2 = 5;
      const deltaY2 = 100;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance-x')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX1, deltaY1)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX1);
          expect(delta.y).eq(deltaY1);

          return subject;
        })
        .mouseMoveBy(deltaX2, deltaY2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });

    it('Activates if the mouse is moved more than the minimum distance in the y axis', () => {
      const deltaX1 = 5;
      const deltaY1 = 100;
      const deltaX2 = 100;
      const deltaY2 = 5;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance-y')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX1, deltaY1)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX1);
          expect(delta.y).eq(deltaY1);

          return subject;
        })
        .mouseMoveBy(deltaX2, deltaY2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });

    it('Activates if the mouse is moved more than the minimum distance in the x and y axis', () => {
      const deltaX1 = 50;
      const deltaY1 = 100;
      const deltaX2 = 10;
      const deltaY2 = 100;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance-xy')
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX1, deltaY1)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX1);
          expect(delta.y).eq(deltaY1);

          return subject;
        })
        .mouseMoveBy(deltaX2, deltaY2)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });

    it('Activates after unsuccessful first drag attempt once the mouse is moved more than the minimum distance', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory('core-draggable-hooks-usedraggable--minimum-distance')
        .findFirstDraggableItem()
        .mouseMoveBy(5, 5)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        })
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

    it('Activates if the mouse is moved more than the minimum distance x and less than tolerance y', () => {
      const deltaX = 100;
      const deltaY = 5;

      cy.visitStory(
        'core-draggable-hooks-usedraggable--minimum-distance-x-tolerance-y'
      )
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        });
    });

    it('Does not activate if the mouse is moved more than the minimum distance x and more than tolerance y', () => {
      const deltaX = 100;
      const deltaY = 150;

      cy.visitStory(
        'core-draggable-hooks-usedraggable--minimum-distance-x-tolerance-y'
      )
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });

    it('Activates if the mouse is moved more than the minimum distance y and less than tolerance x', () => {
      const deltaX = 5;
      const deltaY = 100;

      cy.visitStory(
        'core-draggable-hooks-usedraggable--minimum-distance-y-tolerance-x'
      )
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(deltaX);
          expect(delta.y).eq(deltaY);

          return subject;
        });
    });

    it('Does not activate if the mouse is moved more than the minimum distance y and more than tolerance x', () => {
      const deltaX = 150;
      const deltaY = 100;

      cy.visitStory(
        'core-draggable-hooks-usedraggable--minimum-distance-y-tolerance-x'
      )
        .findFirstDraggableItem()
        .mouseMoveBy(deltaX, deltaY)
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);

          return subject;
        });
    });
  });

  describe('Multiple Draggables', () => {
    it('should render only dragging element', () => {
      cy.visitStory('core-draggable-draggablerenders--basic-setup')
        .findFirstDraggableItem()

        .mouseMoveBy(0, 100);

      cy.get('[data-testid="draggable-status-1"]').should(
        'have.text',
        'updated'
      );
      cy.get('[data-testid="draggable-status-2"]').should(
        'have.text',
        'mounted'
      );
      cy.get('[data-testid="draggable-status-3"]').should(
        'have.text',
        'mounted'
      );
    });
  });
});
