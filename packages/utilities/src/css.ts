export type Transform = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export const CSS = Object.freeze({
  Transform: {
    toString({x, y, scaleX, scaleY}: Transform) {
      return `translate3d(${x ? Math.round(x) : 0}px, ${
        y ? Math.round(y) : 0
      }px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
    },
  },
});
