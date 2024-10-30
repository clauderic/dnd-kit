import {Coordinates} from '@dnd-kit/geometry';
import {getNestedDocuments} from './getNestedDocuments.ts';

export const getDeepScroll = (el: Element | null | undefined): Coordinates => {
  const scroll: Coordinates = {x: 0, y: 0};

  if (!el) {
    return scroll;
  }

  const nestedDocs = getNestedDocuments(el);

  nestedDocs.forEach((doc) => {
    scroll.x = scroll.x + (doc.defaultView?.scrollX || 0);
    scroll.y = scroll.y + (doc.defaultView?.scrollY || 0);
  });

  return scroll;
};
