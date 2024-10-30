import {getComputedStyles} from '../styles/getComputedStyles.ts';
import {isHTMLElement} from '../type-guards/isHTMLElement.ts';
import {getFrameElement} from './get-frame-element.ts';

export function getFrameOffset(el: Element | undefined) {
  const offset = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
  };

  if (!el) {
    return offset;
  }

  let frame = getFrameElement(el);

  while (frame) {
    const rect = frame.getBoundingClientRect();
    const {x: scaleX, y: scaleY} = getScale(frame, rect);

    offset.x = offset.x + rect.left;
    offset.y = offset.y + rect.top;
    offset.scaleX = offset.scaleX * scaleX;
    offset.scaleY = offset.scaleY * scaleY;

    frame = getFrameElement(frame);
  }

  return offset;
}

function getScale(
  element: Element,
  boundingRectangle = element.getBoundingClientRect()
) {
  const width = Math.round(boundingRectangle.width);
  const height = Math.round(boundingRectangle.height);

  if (isHTMLElement(element)) {
    return {
      x: width / element.offsetWidth,
      y: height / element.offsetHeight,
    };
  }

  const styles = getComputedStyles(element);

  return {
    x: (parseFloat(styles.width) || width) / width,
    y: (parseFloat(styles.height) || height) / height,
  };
}
