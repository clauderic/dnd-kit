import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import {getVisibleBoundingRectangle} from '../src/utilities/bounding-rectangle/getVisibleBoundingRectangle.ts';

const originalGetComputedStyle = globalThis.getComputedStyle;

function rectangle(top = 0, bottom = 1000, left = 0, right = 1000) {
  return {top, bottom, left, right, width: right - left, height: bottom - top};
}

function createFixture() {
  const styles = new Map<Element, CSSStyleDeclaration>();
  const ownerWindow = {
    innerWidth: 1000,
    innerHeight: 1000,
    visualViewport: null,
    getComputedStyle: (element: Element) => styles.get(element)!,
  } as unknown as Window;
  const ownerDocument = {defaultView: ownerWindow} as Document;

  function element(parentElement: Element | null, rect = rectangle()) {
    const node = {
      ownerDocument,
      parentElement,
      tagName: 'DIV',
      getBoundingClientRect: () => rect,
    } as unknown as HTMLElement;
    styles.set(node, {
      overflow: 'visible',
      overflowX: 'visible',
      overflowY: 'visible',
      contain: 'none',
      display: 'block',
    } as CSSStyleDeclaration);
    return node;
  }

  const root = element(null);
  Object.assign(root, {
    tagName: 'HTML',
    localName: 'html',
    namespaceURI: 'http://www.w3.org/1999/xhtml',
  });
  const body = element(root, rectangle(-700, 300));
  Object.assign(body, {tagName: 'BODY'});
  Object.assign(ownerDocument, {documentElement: root, body});
  Object.assign(styles.get(body)!, {
    overflow: 'hidden',
    overflowX: 'hidden',
    overflowY: 'hidden',
  });
  const modal = element(body);
  const target = element(modal, rectangle(650, 700, 100, 200));
  globalThis.getComputedStyle = ownerWindow.getComputedStyle;

  return {root, body, modal, target, styles, ownerWindow};
}

afterEach(() => {
  if (originalGetComputedStyle) {
    globalThis.getComputedStyle = originalGetComputedStyle;
  } else {
    Reflect.deleteProperty(globalThis, 'getComputedStyle');
  }
});

describe('getVisibleBoundingRectangle', () => {
  let fixture: ReturnType<typeof createFixture>;

  beforeEach(() => {
    fixture = createFixture();
  });

  it('does not clip a visible modal target to a scrolled body whose overflow propagates', () => {
    expect(getVisibleBoundingRectangle(fixture.target)).toEqual(
      rectangle(650, 700, 100, 200)
    );
  });

  it('preserves the keyboard visibility margin without using the scrolled body edge', () => {
    expect(getVisibleBoundingRectangle(fixture.target, undefined, 0.2)).toEqual(
      rectangle(650, 700, 100, 200)
    );
  });

  it.each(['hidden', 'auto', 'clip'])(
    'still clips the body when root overflow is %s',
    (overflow) => {
      Object.assign(fixture.styles.get(fixture.root)!, {
        overflow,
        overflowX: overflow,
        overflowY: overflow,
      });
      expect(getVisibleBoundingRectangle(fixture.target).height).toBe(0);
    }
  );

  it.each(['size', 'layout', 'style', 'paint', 'content', 'strict'])(
    'still clips with body containment %s',
    (contain) => {
      fixture.styles.get(fixture.body)!.contain = contain;
      expect(getVisibleBoundingRectangle(fixture.target).height).toBe(0);
    }
  );

  it.each(['size', 'layout', 'style', 'paint', 'content', 'strict'])(
    'still clips with root containment %s',
    (contain) => {
      fixture.styles.get(fixture.root)!.contain = contain;
      expect(getVisibleBoundingRectangle(fixture.target).height).toBe(0);
    }
  );

  it('keeps clipping by inner overflow containers', () => {
    Object.assign(fixture.styles.get(fixture.modal)!, {
      overflow: 'hidden',
      overflowX: 'hidden',
      overflowY: 'hidden',
    });
    fixture.modal.getBoundingClientRect = () => rectangle(600, 675) as DOMRect;
    expect(getVisibleBoundingRectangle(fixture.target)).toEqual(
      rectangle(650, 675, 100, 200)
    );
  });

  it('keeps clipping by the visual viewport of the owner window', () => {
    Object.assign(fixture.ownerWindow, {
      visualViewport: {offsetTop: 600, offsetLeft: 0, width: 1000, height: 75},
    });
    expect(getVisibleBoundingRectangle(fixture.target)).toEqual(
      rectangle(650, 675, 100, 200)
    );
  });

  it('does not apply HTML body propagation to another document root', () => {
    Object.assign(fixture.root, {
      localName: 'svg',
      namespaceURI: 'http://www.w3.org/2000/svg',
    });
    expect(getVisibleBoundingRectangle(fixture.target).height).toBe(0);
  });
});
