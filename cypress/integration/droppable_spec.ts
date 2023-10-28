/// <reference path="../support/index.d.ts" />

describe('Droppable', () => {
  describe('Droppable Renders', () => {
    it('should re-render only the dragged item and the container dragged over - no drop', () => {
      cy.visitStory('core-droppablerenders-usedroppable--multiple-droppables');

      cy.get('[data-cypress="droppable-container-A"]').then((droppable) => {
        const coords = droppable[0].getBoundingClientRect();
        return cy
          .get('[data-cypress="draggable-item"]')
          .first()
          .then((draggable) => {
            const initialCoords = draggable[0].getBoundingClientRect();
            return cy
              .wrap(draggable, {log: false})
              .mouseMoveBy(
                coords.x - initialCoords.x + 10,
                coords.y - initialCoords.y + 10,
                {
                  delay: 1000,
                  noDrop: true,
                }
              );
          });
      });

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

      cy.get('[data-testid="droppable-status-A"]').should(
        'have.text',
        'updated'
      );
      cy.get('[data-testid="droppable-status-B"]').should(
        'have.text',
        'mounted'
      );
      cy.get('[data-testid="droppable-status-C"]').should(
        'have.text',
        'mounted'
      );
    });

    it('should re-render only the dragged item and the container dragged over - with drop', () => {
      cy.visitStory('core-droppablerenders-usedroppable--multiple-droppables');

      cy.get('[data-cypress="droppable-container-A"]').then((droppable) => {
        const coords = droppable[0].getBoundingClientRect();
        return cy
          .get('[data-cypress="draggable-item"]')
          .last()
          .then((draggable) => {
            const initialCoords = draggable[0].getBoundingClientRect();
            return cy
              .wrap(draggable, {log: false})
              .mouseMoveBy(
                coords.x - initialCoords.x + 10,
                coords.y - initialCoords.y + 10,
                {
                  delay: 1000,
                  noDrop: false,
                }
              );
          });
      });

      //the dropped item is mounted because it moves to a different container
      for (let i = 1; i <= 3; i++) {
        cy.get(`[data-testid="draggable-status-${i}"]`).should(
          'have.text',
          'mounted'
        );
      }

      cy.get('[data-testid="droppable-status-A"]').should(
        'have.text',
        'updated'
      );
      cy.get('[data-testid="droppable-status-B"]').should(
        'have.text',
        'mounted'
      );
      cy.get('[data-testid="droppable-status-C"]').should(
        'have.text',
        'mounted'
      );
    });
  });
});
