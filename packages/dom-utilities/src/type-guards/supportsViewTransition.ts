interface ViewTransition {
  ready: Promise<void>;
  updateCallbackDone: Promise<void>;
  finished: Promise<void>;
  skipTransition(): void;
}

export function supportsViewTransition(
  document: Document
): document is Document & {
  startViewTransition(updateCallback: () => void): ViewTransition;
} {
  return 'startViewTransition' in document;
}
