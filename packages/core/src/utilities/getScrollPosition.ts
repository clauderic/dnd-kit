function getScrollElementRect(element: Element) {
  if (element === document.scrollingElement) {
    const {innerWidth, innerHeight} = window;

    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight,
    };
  }

  return element.getBoundingClientRect();
}

export function getScrollPosition(scrollingContainer: Element) {
  const scrollElementRect = getScrollElementRect(scrollingContainer);
  const minScroll = {
    x: 0,
    y: 0,
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - scrollElementRect.width,
    y: scrollingContainer.scrollHeight - scrollElementRect.height,
  };

  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;

  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    scrollElementRect,
    maxScroll,
    minScroll,
  };
}
