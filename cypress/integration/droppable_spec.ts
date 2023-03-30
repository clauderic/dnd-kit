/// <reference path="../support/index.d.ts" />

describe('Droppable', () => {
  describe('Droppable Renders', () => {
    it('should re-render only the dragged item and the container dragged over', () => {
      cy.visitStory('core-droppablerenders-usedroppable--multiple-droppables');

      cy.get('[data-cypress="droppable-container-C"]').then((droppable) => {
        const coords = droppable[0].getBoundingClientRect();
        return cy
          .findFirstDraggableItem()
          .mouseMoveBy(coords.x + 10, coords.y + 10, {delay: 1, noDrop: true});
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
        'mounted'
      );
      cy.get('[data-testid="droppable-status-B"]').should(
        'have.text',
        'mounted'
      );
      cy.get('[data-testid="droppable-status-C"]').should(
        'have.text',
        'updated'
      );
    });
  });
});
