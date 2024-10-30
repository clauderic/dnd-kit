import {getDocument} from '../execution-context/getDocument.ts';
import {getFrameElement} from './getFrameElement.ts';

export function getNestedDocuments(el: Element | undefined): Document[] {
  const documents: Document[] = [];

  if (!el) {
    return documents;
  }

  let frame = getFrameElement(el);

  while (frame) {
    const currentDocument = getDocument(frame);

    if (documents.indexOf(currentDocument) === -1) {
      documents.push(currentDocument);
    }

    frame = getFrameElement(frame);
  }

  return documents;
}
