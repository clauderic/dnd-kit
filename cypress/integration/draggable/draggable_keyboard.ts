/// <reference path="../../support/index.d.ts" />

describe('Draggable', () => {
  const KEYBOARD_MOVE_MAGNITUDE = 25;

  describe('Basic setup', () => {
    it('Move item', () => {
      const times = 1;
      cy.visitStory('core-draggable-basic--simple-example')
        .findFirstDraggableItem()
        .keyboardMoveBy(times, 'down')
        .then(([subject, {delta}]) => {
          expect(delta.y).eq(times * KEYBOARD_MOVE_MAGNITUDE);
          return subject;
        })
        .keyboardMoveBy(times, 'right')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(times * KEYBOARD_MOVE_MAGNITUDE);
          return subject;
        });
    });
  });

  describe('Horizontal', () => {
    it('Only moves horizontally', () => {
      const times = 5;

      cy.visitStory('core-draggable-basic--horizontal-axis')
        .findFirstDraggableItem()
        .keyboardMoveBy(times, 'down')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);
          return subject;
        })
        .keyboardMoveBy(times, 'up')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);
          return subject;
        })
        .keyboardMoveBy(times, 'right')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(times * KEYBOARD_MOVE_MAGNITUDE);
          expect(delta.y).eq(0);
          return subject;
        })
        .keyboardMoveBy(times, 'left')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(-times * KEYBOARD_MOVE_MAGNITUDE);
          expect(delta.y).eq(0);
          return subject;
        });
    });
  });

  describe('Vertical', () => {
    it('Only moves vertically', () => {
      const times = 5;

      cy.visitStory('core-draggable-basic--vertical-axis')
        .findFirstDraggableItem()
        .keyboardMoveBy(times, 'right')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);
          return subject;
        })
        .keyboardMoveBy(times, 'left')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(0);
          return subject;
        })
        .keyboardMoveBy(times, 'down')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(times * KEYBOARD_MOVE_MAGNITUDE);
          return subject;
        })
        .keyboardMoveBy(times, 'up')
        .then(([subject, {delta}]) => {
          expect(delta.x).eq(0);
          expect(delta.y).eq(-times * KEYBOARD_MOVE_MAGNITUDE);
          return subject;
        });
    });
  });
});
