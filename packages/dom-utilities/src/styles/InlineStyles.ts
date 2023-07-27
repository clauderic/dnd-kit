type ExtractStringProperties<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};

export type StyleDeclaration = ExtractStringProperties<CSSStyleDeclaration> & {
  viewTransitionName?: string;
};

export class InlineStyles {
  private initial = new Map<string, string>();

  constructor(private element: HTMLElement) {}

  public set(styles: StyleDeclaration) {
    const {element} = this;

    for (const [key, value] of Object.entries(styles)) {
      if (!this.initial.has(key)) {
        this.initial.set(key, element.style.getPropertyValue(key));
      }

      element.style[key as any] = value ?? '';
    }
  }

  public reset() {
    const {element} = this;

    for (const [key, value] of this.initial) {
      element.style[key as any] = value;
    }

    if (element.getAttribute('style') === '') {
      element.removeAttribute('style');
    }
  }
}
