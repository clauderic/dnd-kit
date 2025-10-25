/**
 * Recursively finds all same-origin Document objects:
 * - the current document
 * - any same-origin parent documents
 * - any same-origin child documents (iframes, frames)
 *
 * @param rootDoc - The starting document (defaults to current document)
 * @param seen - Internal set to prevent duplicate traversal
 * @returns An array of all discovered same-origin Document objects
 */
export function getDocuments(
  rootDoc: Document = document,
  seen: Set<Document> = new Set()
): Document[] {
  if (seen.has(rootDoc)) return [];
  seen.add(rootDoc);

  const docs: Document[] = [rootDoc];

  // --- Traverse same-origin child documents ---
  for (const frame of Array.from<HTMLIFrameElement | HTMLFrameElement>(
    rootDoc.querySelectorAll('iframe, frame')
  )) {
    try {
      const childDoc = frame.contentDocument;
      if (childDoc && !seen.has(childDoc)) {
        docs.push(...getDocuments(childDoc, seen));
      }
    } catch {
      // Ignore cross-origin frames
    }
  }

  // --- Traverse same-origin parent documents ---
  try {
    const win = rootDoc.defaultView;
    if (win && win !== window.top) {
      const parentWin = win.parent;
      if (parentWin && parentWin.document && parentWin.document !== rootDoc) {
        docs.push(...getDocuments(parentWin.document, seen));
      }
    }
  } catch {
    // Ignore cross-origin parent access
  }

  return docs;
}
