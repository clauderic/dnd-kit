type ExtractStringProperties<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};

export type StyleDeclaration = ExtractStringProperties<CSSStyleDeclaration>;

export class Styles {
  private initial = new Map<string, string>();

  constructor(private element: Element) {}

  public set(styles: StyleDeclaration) {
    const {element} = this;

    if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
      return;
    }

    for (const [key, value] of Object.entries(styles)) {
      if (!this.initial.has(key)) {
        this.initial.set(key, element.style.getPropertyValue(key));
      }

      element.style[key as any] = value ?? '';
    }
  }

  public reset() {
    const {element} = this;

    if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
      return;
    }

    for (const [key, value] of this.initial) {
      element.style[key as any] = value;
    }

    if (element.getAttribute('style') === '') {
      element.removeAttribute('style');
    }
  }
}
