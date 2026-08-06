// packages/dom/src/global.d.ts
declare global {
  // Optional registry of extra Document objects (e.g. window.open popups) for
  // cross-window drag support. Host apps populate this via registerDndDocument().
  // eslint-disable-next-line no-var
  var __dndKitDocuments__: Set<Document> | undefined;
}

export {};