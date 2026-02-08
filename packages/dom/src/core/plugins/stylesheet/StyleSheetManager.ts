import {CorePlugin} from '@dnd-kit/abstract';
import {derived, reactive, untracked} from '@dnd-kit/state';
import {getRoot, isDocument, isShadowRoot} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';

type CleanupFunction = () => void;

interface SheetRegistration {
  sheet: CSSStyleSheet;
  refCount: number;
  cleanup: CleanupFunction;
}

const sheetRegistry = new Map<
  Document | ShadowRoot,
  Map<string, SheetRegistration>
>();

export class StyleSheetManager extends CorePlugin<DragDropManager> {
  #registeredRules = new Set<string>();

  @reactive
  private accessor additionalRoots = new Set<Document | ShadowRoot>();

  constructor(manager: DragDropManager) {
    super(manager);

    this.registerEffect(this.#syncStyles);
  }

  /**
   * Registers CSS rules to be injected into the active drag operation's
   * document and shadow roots. The StyleSheetManager handles tracking
   * which roots need the styles and cleaning up when they're no longer needed.
   *
   * Returns a cleanup function that unregisters the rules.
   */
  public register(cssRules: string): CleanupFunction {
    this.#registeredRules.add(cssRules);

    return () => {
      this.#registeredRules.delete(cssRules);
    };
  }

  /**
   * Adds an additional root to track for style injection.
   * Returns a cleanup function that removes the root.
   */
  public addRoot(root: Document | ShadowRoot): CleanupFunction {
    untracked(() => {
      const roots = new Set(this.additionalRoots);
      roots.add(root);
      this.additionalRoots = roots;
    });

    return () => {
      untracked(() => {
        const roots = new Set(this.additionalRoots);
        roots.delete(root);
        this.additionalRoots = roots;
      });
    };
  }

  @derived
  private get sourceRoot() {
    const {source} = this.manager.dragOperation;
    return getRoot(source?.element ?? null);
  }

  @derived
  private get targetRoot() {
    const {target} = this.manager.dragOperation;
    return getRoot(target?.element ?? null);
  }

  @derived
  private get roots(): Set<Document | ShadowRoot> {
    const {status} = this.manager.dragOperation;

    if (status.initializing || status.initialized) {
      const roots = [this.sourceRoot, this.targetRoot].filter(
        (root) => root != null
      );
      return new Set([...roots, ...this.additionalRoots]);
    }

    return new Set();
  }

  #syncStyles() {
    const {roots} = this;
    const cleanups: CleanupFunction[] = [];

    for (const root of roots) {
      for (const cssRules of this.#registeredRules) {
        cleanups.push(this.#inject(root, cssRules));
      }
    }

    return () => {
      for (const cleanup of cleanups) {
        cleanup();
      }
    };
  }

  #inject(root: Document | ShadowRoot, cssRules: string): CleanupFunction {
    let rootSheets = sheetRegistry.get(root);

    if (!rootSheets) {
      rootSheets = new Map();
      sheetRegistry.set(root, rootSheets);
    }

    let registration = rootSheets.get(cssRules);

    if (!registration) {
      if (
        !(
          'adoptedStyleSheets' in root &&
          Array.isArray(root.adoptedStyleSheets)
        ) &&
        process.env.NODE_ENV !== 'production'
      ) {
        console.error(
          "Cannot inject styles: This browser doesn't support adoptedStyleSheets"
        );
      }

      const targetWindow = isDocument(root)
        ? root.defaultView
        : root.ownerDocument.defaultView;
      const {CSSStyleSheet} = targetWindow ?? {};

      if (!CSSStyleSheet) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            'Cannot inject styles: CSSStyleSheet constructor not available'
          );
        }

        return () => {};
      }

      const sheet = new CSSStyleSheet();
      sheet.replaceSync(cssRules);
      root.adoptedStyleSheets.push(sheet);

      registration = {
        sheet,
        refCount: 0,
        cleanup: () => {
          if (
            isDocument(root) ||
            (isShadowRoot(root) && root.host?.isConnected)
          ) {
            const index = root.adoptedStyleSheets.indexOf(sheet);
            if (index !== -1) {
              root.adoptedStyleSheets.splice(index, 1);
            }
          }

          rootSheets!.delete(cssRules);

          if (rootSheets!.size === 0) {
            sheetRegistry.delete(root);
          }
        },
      };
      rootSheets.set(cssRules, registration);
    }

    registration.refCount++;

    let disposed = false;

    return () => {
      if (disposed) return;
      disposed = true;

      registration!.refCount--;

      if (registration!.refCount === 0) {
        registration!.cleanup();
      }
    };
  }
}
