/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Visit a Storybook story
     */
    visitStory(id: string): Chainable<Window>;

    /**
     * Find the first draggable item in the document.
     */
    findFirstDraggableItem(): Chainable<Element>;

    /**
     * Find a draggable handle within an item.
     */
    findDraggableHandle(): Chainable<Element>;

    /**
     * Move a draggable element by the specified number of pixels.
     */
    mouseMoveBy(
      x: number,
      y: number,
      options?: {delay: number}
    ): Chainable<
      [
        Element,
        {
          initialRect: ClientRect;
          finalRect: ClientRect;
          delta: {x: number; y: number};
        }
      ]
    >;

    /**
     * Move a draggable element by a specified direction and number of pixels.
     */
    mouseMoveInDirection(
      magnitude: number,
      direction: string
    ): Chainable<
      [
        Element,
        {
          initialRect: ClientRect;
          finalRect: ClientRect;
          delta: {x: number; y: number};
        }
      ]
    >;

    /**
     * Move a draggable element in a given direction.
     */
    keyboardMoveBy(
      amount: number,
      direction: string
    ): Chainable<
      [
        Element,
        {
          initialRect: ClientRect;
          finalRect: ClientRect;
          delta: {x: number; y: number};
        }
      ]
    >;

    /**
     * Find a draggable element node by id
     */
    findItemById(id: string): Chainable<Element>;

    /**
     * Get the index for a given sortable element
     */
    getIndexForItem(id: string): Chainable<number>;
  }
}
