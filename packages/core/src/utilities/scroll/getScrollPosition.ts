export function getScrollPosition(scrollingContainer: Element) {
  const minScroll = {
    x: 0,
    y: 0,
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - scrollingContainer.clientWidth,
    y: scrollingContainer.scrollHeight - scrollingContainer.clientHeight,
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
    maxScroll,
    minScroll,
  };
}
