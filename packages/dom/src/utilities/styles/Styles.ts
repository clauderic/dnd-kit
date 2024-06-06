import {supportsStyle} from '../type-guards/supportsStyle.ts';

type ExtractStringProperties<T> = {
  [K in keyof T]?: T[K] extends string ? string : never;
};

export type StyleDeclaration = ExtractStringProperties<CSSStyleDeclaration> & {
  viewTransitionName?: string;
};

export class Styles {
  private initial = new Map<string, string>();

  constructor(private element: Element) {}

  public set(properties: Record<string, string | number>, prefix = '') {
    const {element} = this;

    if (!supportsStyle(element)) {
      return;
    }

    for (const [key, value] of Object.entries(properties)) {
      const property = `${prefix}${key}`;

      if (!this.initial.has(property)) {
        this.initial.set(property, element.style.getPropertyValue(property));
      }

      element.style.setProperty(
        property,
        typeof value === 'string' ? value : `${value}px`
      );
    }
  }

  public remove(properties: string[], prefix = '') {
    const {element} = this;

    if (!supportsStyle(element)) {
      return;
    }

    for (const key of properties) {
      const property = `${prefix}${key}`;

      element.style.removeProperty(property);
    }
  }

  public reset() {
    const {element} = this;

    if (!supportsStyle(element)) {
      return;
    }

    for (const [key, value] of this.initial) {
      element.style.setProperty(key, value);
    }

    if (element.getAttribute('style') === '') {
      element.removeAttribute('style');
    }
  }
}
