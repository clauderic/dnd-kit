// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

function getDocumentScroll() {
  if (document.scrollingElement) {
    const {scrollTop, scrollLeft} = document.scrollingElement;

    return {
      x: scrollTop,
      y: scrollLeft,
    };
  }

  return {
    x: 0,
    y: 0,
  };
}

Cypress.Commands.add('findFirstDraggableItem', () => {
  return cy.get(`[data-cypress="draggable-item"]`).first();
});

Cypress.Commands.add(
  'findDraggableHandle',
  {
    prevSubject: 'element',
  },
  (subject) => {
    return cy
      .wrap(subject, {log: false})
      .find(`[data-cypress="draggable-handle"]`);
  }
);

Cypress.Commands.add(
  'mouseMoveBy',
  {
    prevSubject: 'element',
  },
  (
    subject,
    x: number,
    y: number,
    options?: {delay: number; noDrop?: boolean}
  ) => {
    cy.wrap(subject, {log: false})
      .then((subject) => {
        const initialRect = subject.get(0).getBoundingClientRect();
        const windowScroll = getDocumentScroll();

        return [subject, initialRect, windowScroll] as const;
      })
      .then(([subject, initialRect, initialWindowScroll]) => {
        let resultOps = cy
          .wrap(subject)
          .trigger('mousedown', {force: true})
          .wait(options?.delay || 0, {log: Boolean(options?.delay)})
          .trigger('mousemove', {
            force: true,
            clientX: Math.floor(
              initialRect.left + initialRect.width / 2 + x / 2
            ),
            clientY: Math.floor(
              initialRect.top + initialRect.height / 2 + y / 2
            ),
          })
          .trigger('mousemove', {
            force: true,
            clientX: Math.floor(initialRect.left + initialRect.width / 2 + x),
            clientY: Math.floor(initialRect.top + initialRect.height / 2 + y),
          });

        if (!options?.noDrop) {
          resultOps = resultOps.wait(100).trigger('mouseup', {force: true});
        }

        resultOps.wait(250).then((subject: any) => {
          const finalRect = subject.get(0).getBoundingClientRect();
          const windowScroll = getDocumentScroll();
          const windowScrollDelta = {
            x: windowScroll.x - initialWindowScroll.x,
            y: windowScroll.y - initialWindowScroll.y,
          };

          const delta = {
            x: Math.round(
              finalRect.left - initialRect.left - windowScrollDelta.x
            ),
            y: Math.round(
              finalRect.top - initialRect.top - windowScrollDelta.y
            ),
          };

          return [subject, {initialRect, finalRect, delta}] as const;
        });
      });
  }
);

Cypress.Commands.add('findItemById', (id) => {
  return cy.get(`[data-id="${id}"]`);
});

Cypress.Commands.add('getIndexForItem', (id) => {
  return cy
    .get(`[data-id="${id}"]`)
    .invoke('attr', 'data-index')
    .then((index) => {
      return index ? parseInt(index, 10) : -1;
    });
});

Cypress.Commands.add('visitStory', (id) => {
  return cy.visit(`/iframe.html?id=${id}`, {log: false});
});

const Keys = {
  Space: ' ',
};

Cypress.Commands.add(
  'keyboardMoveBy',
  {
    prevSubject: 'element',
  },
  (subject, times: number, direction: string) => {
    const arrowKey = `{${direction}arrow}`;

    Cypress.log({
      $el: subject,
      name: 'Move',
    });

    cy.wrap(subject, {log: false})
      .focus({log: false})
      .type(Keys.Space, {
        delay: 150,
        scrollBehavior: false,
        force: true,
        log: false,
      })
      .closest('body')
      .type(arrowKey.repeat(times), {
        scrollBehavior: false,
        delay: 150,
        force: true,
      })
      .wait(150)
      .type(Keys.Space, {
        force: true,
        scrollBehavior: false,
      })
      .wait(250);
  }
);

//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
