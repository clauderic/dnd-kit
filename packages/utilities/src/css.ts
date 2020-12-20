export type Transform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export interface Transition {
  property: string;
  easing: string;
  duration: number;
}

export const CSS = Object.freeze({
  Translate: {
    toString(transform: Transform | null) {
      if (!transform) {
        return;
      }

      const {x, y} = transform;

      return `translate3d(${x ? Math.round(x) : 0}px, ${
        y ? Math.round(y) : 0
      }px, 0)`;
    },
  },
  Scale: {
    toString(transform: Transform | null) {
      if (!transform) {
        return;
      }

      const {scaleX, scaleY} = transform;

      return `scaleX(${scaleX}) scaleY(${scaleY})`;
    },
  },
  Transform: {
    toString(transform: Transform | null) {
      if (!transform) {
        return;
      }

      return [
        CSS.Translate.toString(transform),
        CSS.Scale.toString(transform),
      ].join(' ');
    },
  },
  Transition: {
    toString({property, duration, easing}: Transition) {
      return `${property} ${duration}ms ${easing}`;
    },
  },
});
