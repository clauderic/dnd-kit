import {getWindow} from '../execution-context/getWindow.js';

export function isDocument(node: Node): node is Document {
  const {Document} = getWindow(node);

  return node instanceof Document;
}
