import {CorePlugin, configurator} from '@dnd-kit/abstract';
import {derived, reactive, untracked} from '@dnd-kit/state';
import {getRoot, isDocument, isShadowRoot} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';

type CleanupFunction = () => void;

export interface StyleInjectorOptions {
  nonce?: string;
}

export interface StyleRegistrationOptions {
  /**
   * Keep the rules injected in a root after the drag operation that required
   * them ends, until the rules are unregistered or the plugin is destroyed.
   *
   * Adding or removing a stylesheet makes the browser recalculate styles for
   * the entire document, so rules that are injected and removed on every drag
   * add that cost to the start and end of each drag. Only retain rules that
   * have no effect outside of a drag operation, such as rules scoped to
   * `data-dnd-*` attributes.
   *
   * @default false
   */
  retain?: boolean;
}

interface StyleRegistration {
  refCount: number;
  cleanup: CleanupFunction;
}

const styleRegistry = new Map<
  Document | ShadowRoot,
  Map<string, StyleRegistration>
>();

function isAttached(root: Document | ShadowRoot) {
  return isShadowRoot(root) ? root.host.isConnected : root.defaultView != null;
}

export class StyleInjector extends CorePlugin<
  DragDropManager,
  StyleInjectorOptions
> {
  /**
   * Registered CSS rules, mapped to whether they are retained between drag
   * operations.
   */
  @reactive
  private accessor registeredRules = new Map<string, boolean>();

  @reactive
  private accessor additionalRoots = new Set<Document | ShadowRoot>();

  /**
   * Roots that have taken part in a drag operation, where retained rules stay
   * injected between drag operations.
   */
  #retainedRoots = new Set<Document | ShadowRoot>();

  #injections = new Map<Document | ShadowRoot, Map<string, CleanupFunction>>();

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
  public register(
    cssRules: string,
    options?: StyleRegistrationOptions
  ): CleanupFunction {
    untracked(() => {
      const rules = new Map(this.registeredRules);
      rules.set(cssRules, options?.retain ?? false);
      this.registeredRules = rules;
    });

    return () => {
      untracked(() => {
        const rules = new Map(this.registeredRules);
        rules.delete(cssRules);
        this.registeredRules = rules;
      });
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

  /**
   * Injects and removes only the rules whose target roots changed, so that a
   * stylesheet that is still needed is never removed and added back.
   */
  #syncStyles() {
    const {roots, registeredRules} = this;

    for (const root of roots) {
      this.#retainedRoots.add(root);
    }

    const wanted = new Map<Document | ShadowRoot, Set<string>>();

    for (const root of this.#retainedRoots) {
      const active = roots.has(root);

      if (!active && !isAttached(root)) {
        this.#retainedRoots.delete(root);
        continue;
      }

      for (const [cssRules, retain] of registeredRules) {
        if (!active && !retain) continue;

        let rules = wanted.get(root);

        if (!rules) {
          rules = new Set();
          wanted.set(root, rules);
        }

        rules.add(cssRules);
      }
    }

    for (const [root, injected] of this.#injections) {
      const rules = wanted.get(root);

      for (const [cssRules, cleanup] of injected) {
        if (rules?.has(cssRules)) continue;

        cleanup();
        injected.delete(cssRules);
      }

      if (injected.size === 0) {
        this.#injections.delete(root);
      }
    }

    for (const [root, rules] of wanted) {
      let injected = this.#injections.get(root);

      if (!injected) {
        injected = new Map();
        this.#injections.set(root, injected);
      }

      for (const cssRules of rules) {
        if (!injected.has(cssRules)) {
          injected.set(cssRules, this.#inject(root, cssRules));
        }
      }
    }
  }

  public destroy() {
    for (const injected of this.#injections.values()) {
      for (const cleanup of injected.values()) {
        cleanup();
      }
    }

    this.#injections.clear();
    this.#retainedRoots.clear();

    super.destroy();
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
