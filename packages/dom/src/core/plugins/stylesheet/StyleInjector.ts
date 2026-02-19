import {CorePlugin, configurator} from '@dnd-kit/abstract';
import {derived, reactive, untracked} from '@dnd-kit/state';
import {getRoot, isDocument, isShadowRoot} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';

type CleanupFunction = () => void;

export interface StyleInjectorOptions {
  nonce?: string;
}

interface StyleRegistration {
  refCount: number;
  cleanup: CleanupFunction;
}

const styleRegistry = new Map<
  Document | ShadowRoot,
  Map<string, StyleRegistration>
>();

export class StyleInjector extends CorePlugin<
  DragDropManager,
  StyleInjectorOptions
> {
  #registeredRules = new Set<string>();

  @reactive
  private accessor additionalRoots = new Set<Document | ShadowRoot>();

  constructor(manager: DragDropManager, options?: StyleInjectorOptions) {
    super(manager, options);

    this.registerEffect(this.#syncStyles);
  }

  /**
   * Registers CSS rules to be injected into the active drag operation's
   * document and shadow roots. The StyleInjector handles tracking
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
    let rootStyles = styleRegistry.get(root);

    if (!rootStyles) {
      rootStyles = new Map();
      styleRegistry.set(root, rootStyles);
    }

    let registration = rootStyles.get(cssRules);

    if (!registration) {
      const created = isDocument(root)
        ? this.#injectStyleElement(root, rootStyles, cssRules)
        : this.#injectAdoptedSheet(root, rootStyles, cssRules);

      if (!created) {
        return () => {};
      }

      registration = created;
      rootStyles.set(cssRules, registration);
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

  /**
   * For Document roots, prepend a <style> element to <head> so that any
   * @layer declarations appear before layers from regular stylesheets,
   * giving them the lowest cascade priority.
   */
  #injectStyleElement(
    root: Document,
    rootStyles: Map<string, StyleRegistration>,
    cssRules: string
  ): StyleRegistration | null {
    const style = root.createElement('style');
    const {nonce} = this.options ?? {};

    if (nonce) {
      style.setAttribute('nonce', nonce);
    }

    style.textContent = cssRules;
    root.head.prepend(style);

    const observer = new MutationObserver((entries) => {
      for (const entry of entries) {
        for (const node of Array.from(entry.removedNodes)) {
          if (node === style) {
            root.head.prepend(style);
            return;
          }
        }
      }
    });

    observer.observe(root.head, {childList: true});

    return {
      refCount: 0,
      cleanup: () => {
        observer.disconnect();
        style.remove();

        rootStyles.delete(cssRules);

        if (rootStyles.size === 0) {
          styleRegistry.delete(root);
        }
      },
    };
  }

  /**
   * For ShadowRoot roots, use adoptedStyleSheets to avoid DOM side effects
   * like interfering with :first-child or :nth-child selectors.
   */
  #injectAdoptedSheet(
    root: ShadowRoot,
    rootStyles: Map<string, StyleRegistration>,
    cssRules: string
  ): StyleRegistration | null {
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

    const targetWindow = root.ownerDocument.defaultView;
    const {CSSStyleSheet} = targetWindow ?? {};

    if (!CSSStyleSheet) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Cannot inject styles: CSSStyleSheet constructor not available'
        );
      }

      return null;
    }

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssRules);
    root.adoptedStyleSheets.push(sheet);

    return {
      refCount: 0,
      cleanup: () => {
        if (isShadowRoot(root) && root.host?.isConnected) {
          const index = root.adoptedStyleSheets.indexOf(sheet);
          if (index !== -1) {
            root.adoptedStyleSheets.splice(index, 1);
          }
        }

        rootStyles.delete(cssRules);

        if (rootStyles.size === 0) {
          styleRegistry.delete(root);
        }
      },
    };
  }

  static configure = configurator(StyleInjector);
}
