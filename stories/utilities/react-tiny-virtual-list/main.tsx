import * as React from 'react';
import * as PropTypes from 'prop-types';
import SizeAndPositionManager, {ItemSize} from './SizeAndPositionManager';
import {
  ALIGNMENT,
  DIRECTION,
  SCROLL_CHANGE_REASON,
  marginProp,
  oppositeMarginProp,
  positionProp,
  sizeProp,
} from './constants';

// Observer

// const o = new IntersectionObserver((entry, observer) => {

// });

// o.observe();

export {DIRECTION as ScrollDirection} from './constants';

export type ItemPosition = 'absolute' | 'sticky';

export interface ItemStyle {
  position: ItemPosition;
  top?: number;
  left: number;
  width: string | number;
  height?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  zIndex?: number;
}

interface StyleCache {
  [id: number]: ItemStyle;
}

export interface ItemInfo {
  index: number;
  style: ItemStyle;
}

export interface RenderedRows {
  startIndex: number;
  stopIndex: number;
}

export interface Props {
  className?: string;
  estimatedItemSize?: number;
  viewportHeight: number | string;
  itemCount: number;
  itemSize: ItemSize;
  overscanCount?: number;
  scrollOffset?: number;
  scrollToIndex?: number;
  scrollToAlignment?: ALIGNMENT;
  scrollDirection?: DIRECTION;
  stickyIndices?: number[];
  style?: React.CSSProperties;
  width?: number | string;
  onItemsRendered?({startIndex, stopIndex}: RenderedRows): void;
  onScroll?(offset: number, event: UIEvent): void;
  renderItem(itemInfo: ItemInfo): React.ReactNode;
}

export interface State {
  offset: number;
  scrollChangeReason: SCROLL_CHANGE_REASON;
}

const STYLE_INNER: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  minHeight: '100%',
};

const STYLE_ITEM: {
  position: ItemStyle['position'];
  top: ItemStyle['top'];
  left: ItemStyle['left'];
  width: ItemStyle['width'];
} = {
  position: 'absolute' as ItemPosition,
  top: 0,
  left: 0,
  width: '100%',
};

const STYLE_STICKY_ITEM = {
  ...STYLE_ITEM,
  position: 'sticky' as ItemPosition,
};

// Modified ripoff of: https://github.com/clauderic/react-tiny-virtual-list
export default class VirtualList extends React.PureComponent<Props, State> {
  static defaultProps = {
    overscanCount: 3,
    scrollDirection: DIRECTION.VERTICAL,
    width: '100%',
  };

  static propTypes = {
    estimatedItemSize: PropTypes.number,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    itemCount: PropTypes.number.isRequired,
    itemSize: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.array,
      PropTypes.func,
    ]).isRequired,
    onScroll: PropTypes.func,
    onItemsRendered: PropTypes.func,
    overscanCount: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    scrollOffset: PropTypes.number,
    scrollToIndex: PropTypes.number,
    scrollToAlignment: PropTypes.oneOf([
      ALIGNMENT.AUTO,
      ALIGNMENT.START,
      ALIGNMENT.CENTER,
      ALIGNMENT.END,
    ]),
    scrollDirection: PropTypes.oneOf([
      DIRECTION.HORIZONTAL,
      DIRECTION.VERTICAL,
    ]),
    stickyIndices: PropTypes.arrayOf(PropTypes.number),
    style: PropTypes.object,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  itemSizeGetter = (itemSize: Props['itemSize']) => {
    return (index: number) => this.getSize(index, itemSize);
  };

  sizeAndPositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: this.itemSizeGetter(this.props.itemSize),
    estimatedItemSize: this.getEstimatedItemSize(),
  });

  readonly state: State = {
    offset:
      this.props.scrollOffset ||
      (this.props.scrollToIndex != null &&
        this.getOffsetForIndex(this.props.scrollToIndex)) ||
      0,
    scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
  };

  private styleCache: StyleCache = {};

  componentWillReceiveProps(nextProps: Props) {
    const {
      estimatedItemSize,
      itemCount,
      itemSize,
      scrollOffset,
      scrollToAlignment,
      scrollToIndex,
    } = this.props;
    const scrollPropsHaveChanged =
      nextProps.scrollToIndex !== scrollToIndex ||
      nextProps.scrollToAlignment !== scrollToAlignment;
    const itemPropsHaveChanged =
      nextProps.itemCount !== itemCount ||
      nextProps.itemSize !== itemSize ||
      nextProps.estimatedItemSize !== estimatedItemSize;

    if (nextProps.itemSize !== itemSize) {
      this.sizeAndPositionManager.updateConfig({
        itemSizeGetter: this.itemSizeGetter(nextProps.itemSize),
      });
    }

    if (
      nextProps.itemCount !== itemCount ||
      nextProps.estimatedItemSize !== estimatedItemSize
    ) {
      this.sizeAndPositionManager.updateConfig({
        itemCount: nextProps.itemCount,
        estimatedItemSize: this.getEstimatedItemSize(nextProps),
      });
    }

    if (itemPropsHaveChanged) {
      this.recomputeSizes();
    }

    if (nextProps.scrollOffset !== scrollOffset) {
      this.setState({
        offset: nextProps.scrollOffset || 0,
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
      });
    } else if (
      typeof nextProps.scrollToIndex === 'number' &&
      (scrollPropsHaveChanged || itemPropsHaveChanged)
    ) {
      this.setState({
        offset: this.getOffsetForIndex(
          nextProps.scrollToIndex,
          nextProps.scrollToAlignment,
          nextProps.itemCount
        ),
        scrollChangeReason: SCROLL_CHANGE_REASON.REQUESTED,
      });
    }
  }

  getOffsetForIndex(
    index: number,
    scrollToAlignment = this.props.scrollToAlignment,
    itemCount: number = this.props.itemCount
  ): number {
    const {scrollDirection = DIRECTION.VERTICAL} = this.props;

    if (index < 0 || index >= itemCount) {
      index = 0;
    }

    // @ts-ignore
    const a = this.props[sizeProp[scrollDirection]];
    const b = (this.state && this.state.offset) || 0;

    return this.sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: a,
      currentOffset: b,
      targetIndex: index,
    });
  }

  recomputeSizes(startIndex = 0) {
    this.styleCache = {};
    this.sizeAndPositionManager.resetItem(startIndex);
  }

  render() {
    const {
      viewportHeight: height,
      overscanCount = 3,
      renderItem,
      onItemsRendered,
      scrollDirection = DIRECTION.VERTICAL,
      stickyIndices,
    } = this.props;
    const {offset} = this.state;
    // const containerSize = this.props[sizeProp[scrollDirection]] || 0;
    const containerSize = height as number;
    const {start, stop} = this.sizeAndPositionManager.getVisibleRange({
      containerSize,
      offset,
      overscanCount,
    });
    const items: React.ReactNode[] = [];
    const innerStyle = {
      ...STYLE_INNER,
      [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize(),
    };

    if (stickyIndices != null && stickyIndices.length !== 0) {
      stickyIndices.forEach((index: number) =>
        items.push(
          renderItem({
            index,
            style: this.getStyle(index, true),
          })
        )
      );

      if (scrollDirection === DIRECTION.HORIZONTAL) {
        innerStyle.display = 'flex';
      }
    }

    if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
      for (let index = start; index <= stop; index++) {
        if (stickyIndices != null && stickyIndices.includes(index)) {
          continue;
        }

        items.push(
          renderItem({
            index,
            style: this.getStyle(index, false),
          })
        );
      }

      if (typeof onItemsRendered === 'function') {
        onItemsRendered({
          startIndex: start,
          stopIndex: stop,
        });
      }
    }

    return (
      <div ref={this.props.ref} style={innerStyle}>
        {items}
      </div>
    );
  }

  private getEstimatedItemSize(props = this.props) {
    return (
      props.estimatedItemSize ||
      (typeof props.itemSize === 'number' && props.itemSize) ||
      50
    );
  }

  private getSize(index: number, itemSize: any) {
    if (typeof itemSize === 'function') {
      return itemSize(index);
    }

    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  }

  private getStyle(index: number, sticky: boolean) {
    const style = this.styleCache[index];

    if (style) {
      return style;
    }

    const {scrollDirection = DIRECTION.VERTICAL} = this.props;
    const {
      size,
      offset,
    } = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

    return (this.styleCache[index] = sticky
      ? {
          ...STYLE_STICKY_ITEM,
          [sizeProp[scrollDirection]]: size,
          [marginProp[scrollDirection]]: offset,
          [oppositeMarginProp[scrollDirection]]: -(offset + size),
          zIndex: 1,
        }
      : {
          ...STYLE_ITEM,
          [sizeProp[scrollDirection]]: size,
          [positionProp[scrollDirection]]: offset,
        });
  }
}
