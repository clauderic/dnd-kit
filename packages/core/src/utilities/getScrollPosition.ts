export function getScrollPosition(scrollingContainer: Element) {
  const maxCoordinates =
    scrollingContainer === document.scrollingElement
      ? {
          width: window.innerWidth,
          height: window.innerHeight,
        }
      : scrollingContainer.getBoundingClientRect();

  const isTop = scrollingContainer.scrollTop === 0;
  const isBottom =
    scrollingContainer.scrollTop + maxCoordinates.height >=
    scrollingContainer.scrollHeight;
  const isLeft = scrollingContainer.scrollLeft === 0;
  const isRight =
    scrollingContainer.scrollLeft + maxCoordinates.width >=
    scrollingContainer.scrollWidth;

  return {isTop, isLeft, isBottom, isRight};
}
