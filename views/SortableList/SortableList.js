import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ScrollView, View, StyleSheet, Platform, RefreshControl, ViewPropTypes} from 'react-native';
import {shallowEqual, swapArrayElements} from './utils';
import Row from './Row';

const AUTOSCROLL_INTERVAL = 100;
const ZINDEX = Platform.OS === 'ios' ? 'zIndex' : 'elevation';

function uniqueRowKey(key) {
  return `${key}${uniqueRowKey.id}`
}

uniqueRowKey.id = 0

export default class SortableList extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired, 
    order: PropTypes.arrayOf(PropTypes.any),
    style: ViewPropTypes.style,
    contentContainerStyle: ViewPropTypes.style,
    sortingEnabled: PropTypes.bool,
    scrollEnabled: PropTypes.bool,
    horizontal: PropTypes.bool,
    refreshControl: PropTypes.element,
    autoscrollAreaSize: PropTypes.number,
    rowActivationTime: PropTypes.number,
    manuallyActivateRows: PropTypes.bool,

    renderRow: PropTypes.func.isRequired,
    renderFooter: PropTypes.func,

    onChangeOrder: PropTypes.func,
    onActivateRow: PropTypes.func,
    onReleaseRow: PropTypes.func,
  };

  static defaultProps = {
    sortingEnabled: true,
    scrollEnabled: true,
    autoscrollAreaSize: 60,
    manuallyActivateRows: false
  }

  /**
   * Stores refs to rows’ components by keys.
   */
  _rows = {};

  /**
   * Stores promises of rows’ layouts.
   */
  _rowsLayouts = {};
  _resolveRowLayout = {};

  _contentOffset = {x: 0, y: 0};

  state = {
    animated: false,
    order: this.props.order || Object.keys(this.props.data),
    rowsLayouts: null,
    containerLayout: null,
    data: this.props.data,
    activeRowKey: null,
    activeRowIndex: null,
    releasedRowKey: null,
    sortingEnabled: this.props.sortingEnabled,
    scrollEnabled: this.props.scrollEnabled
  };
  _order = this.props.order || Object.keys(this.props.data)
  _data = this.props.data

  constructor(props) {
    super(props)

    
  }

  setData(newData) {
    this._data = newData
  }

  setOrder(newOrder) {
    this._order = newOrder
  }

  componentWillMount() {
    /*this.state*/ this._order.forEach((key) => {
      this._rowsLayouts[key] = new Promise((resolve) => {
        this._resolveRowLayout[key] = resolve;
      });
    });

    if (this.props.renderFooter && !this.props.horizontal) {
      this._footerLayout = new Promise((resolve) => {
        this._resolveFooterLayout = resolve;
      });
    }
  }

  componentDidMount() {
    this._onUpdateLayouts();
  }

  deleteItem(nextData, deletedKey) {
    let order = this._order
    var nextOrder = Array.from(order)

    var idx = order.indexOf(deletedKey)
    if (idx > -1) {
      nextOrder.splice(idx, 1)
    }
    nextOrder = nextOrder || Object.keys(nextData)

    delete nextData[deletedKey]
    delete this._rowsLayouts[deletedKey]
    // uniqueRowKey.id++;
    // this._rowsLayouts = {};
    // nextOrder.forEach((key) => {
    //   this._rowsLayouts[key] = new Promise((resolve) => {
    //     this._resolveRowLayout[key] = resolve;
    //   });
    // });

    let deletedIdx = -1
    let deletedWidth = 0
    for (var i in order) {
      var key = order[i]
      if (key == deletedKey) {
        deletedIdx = i
        let row = this._rows[key]
        if (row) {
          row.fadeOut()
          deletedWidth = row._layout.width
        }
      } else if (deletedIdx > -1) {
        let row = this._rows[key]
        if (row) {
          let layout = row._layout
          row.moveBy({
            dx: -(deletedWidth),
            dy: 0,
            animated: true
          })
        }
      }
    }
    this._contentWidth = this._contentWidth - deletedWidth
    
    this._order = nextOrder
    this._data = nextData

    console.log(this._order)
    console.log(this._data)
  }

  componentWillReceiveProps(nextProps) {
    let order = this._order
    let data = this._data
    // const {data} = this.props; //this.state
    // const {order} = this.state; /* rb */
    let {data: nextData, order: nextOrder} = nextProps;

    if (data && nextData && !shallowEqual(data, nextData)) {
      nextOrder = nextOrder || Object.keys(nextData)
      uniqueRowKey.id++;
      this._rowsLayouts = {};
      nextOrder.forEach((key) => {
        this._rowsLayouts[key] = new Promise((resolve) => {
          this._resolveRowLayout[key] = resolve;
        });
      });
      this._order = nextOrder
      this._data = nextData
      this.setState({
        animated: false,
        data: nextData,
        containerLayout: null,
        rowsLayouts: null,
        order: nextOrder
      });

    } else if (order && nextOrder && !shallowEqual(order, nextOrder)) {
      this._order = nextOrder
      this.setState({order: nextOrder});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let data = this._data
    // const {data} = this.props; //this.state
    const {data: prevData} = prevProps.data; //prevState;

    if (data && prevData && !shallowEqual(data, prevData)) {
      this._onUpdateLayouts();
    }
  }

  scrollBy({dx = 0, dy = 0, animated = false}) {
    if (this.props.horizontal) {
      this._contentOffset.x += dx;
    } else {
      this._contentOffset.y += dy;
    }

    this._scroll(animated);
  }

  scrollTo({x = 0, y = 0, animated = false}) {
    if (this.props.horizontal) {
      this._contentOffset.x = x;
    } else {
      this._contentOffset.y = y;
    }

    this._scroll(animated);
  }

  scrollToRowKey({key, animated = false}) {
    const {/*order,*/ containerLayout, rowsLayouts} = this.state;
    let order = this._order;

    let keyX = 0;
    let keyY = 0;

    for (const rowKey of order) {
      if (rowKey === key) {
          break;
      }

      keyX += rowsLayouts[rowKey].width;
      keyY += rowsLayouts[rowKey].height;
    }

    // Scroll if the row is not visible.
    if (
      this.props.horizontal
        ? (keyX < this._contentOffset.x || keyX > this._contentOffset.x + containerLayout.width)
        : (keyY < this._contentOffset.y || keyY > this._contentOffset.y + containerLayout.height)
    ) {
      if (this.props.horizontal) {
        this._contentOffset.x = keyX;
      } else {
        this._contentOffset.y = keyY;
      }

      this._scroll(animated);
    }
  }

  render() {
    let contentWidth = this._contentWidth;
    const {contentContainerStyle, horizontal, style} = this.props;
    const {animated, contentHeight, scrollEnabled} = this.state;
    const containerStyle = StyleSheet.flatten([style, {opacity: Number(animated)}])
    const innerContainerStyle = [
      styles.rowsContainer,
      horizontal ? {width: contentWidth} : {height: contentHeight},
    ];
    let {refreshControl} = this.props;

    if (refreshControl && refreshControl.type === RefreshControl) {
      refreshControl = React.cloneElement(this.props.refreshControl, {
        enabled: scrollEnabled, // fix for Android
      });
    }

    return (
      <View style={containerStyle} ref={this._onRefContainer}>
        <ScrollView
          refreshControl={refreshControl}
          ref={this._onRefScrollView}
          horizontal={horizontal}
          contentContainerStyle={contentContainerStyle}
          scrollEventThrottle={2}
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          onScroll={this._onScroll}>
          <View style={innerContainerStyle}>
            {this._renderRows()}
          </View>
          {this._renderFooter()}
        </ScrollView>
      </View>
    );
  }

  _renderRows() {
    const {horizontal, rowActivationTime, sortingEnabled, renderRow} = this.props;
    const {animated,/* order, data, */ activeRowKey, releasedRowKey, rowsLayouts} = this.state;
    let order = this._order
    let data = this._data

    let nextX = 0;
    let nextY = 0;

    return order.map((key, index) => {
      const style = {[ZINDEX]: 0};
      const location = {x: 0, y: 0};

      if (rowsLayouts) {
        if (horizontal) {
          location.x = nextX;
          nextX += rowsLayouts[key].width;
        } else {
          location.y = nextY;
          nextY += rowsLayouts[key].height;
        }
      }

      const active = activeRowKey === key;
      const released = releasedRowKey === key;

      if (active || released) {
        style[ZINDEX] = 100;
      }

      return (
        <Row
          key={uniqueRowKey(key)}
          ref={this._onRefRow.bind(this, key)}
          horizontal={horizontal}
          activationTime={rowActivationTime}
          animated={animated && !active}
          disabled={!sortingEnabled}
          style={style}
          location={location}
          onLayout={!rowsLayouts ? this._onLayoutRow.bind(this, key) : null}
          onActivate={this._onActivateRow.bind(this, key, index)}
          onPress={this._onPressRow.bind(this, key)}
          onRelease={this._onReleaseRow.bind(this, key)}
          onMove={this._onMoveRow}
          manuallyActivateRows={this.props.manuallyActivateRows}>
          {renderRow({
            key,
            data: data[key],
            disabled: !sortingEnabled,
            active,
            index,
          })}
        </Row>
      );
    });
  }

  _renderFooter() {
    if (!this.props.renderFooter || this.props.horizontal) {
      return null;
    }

    const {footerLayout} = this.state;

    return (
      <View onLayout={!footerLayout ? this._onLayoutFooter : null}>
        {this.props.renderFooter()}
      </View>
    );
  }

  _onUpdateLayouts() {
    Promise.all([this._footerLayout, ...Object.values(this._rowsLayouts)])
      .then(([footerLayout, ...rowsLayouts]) => {
        // Can get correct container’s layout only after rows’s layouts.
        this._container.measure((x, y, width, height, pageX, pageY) => {
          const rowsLayoutsByKey = {};
          let contentHeight = 0;
          let contentWidth = 0;

          rowsLayouts.forEach(({rowKey, layout}) => {
            rowsLayoutsByKey[rowKey] = layout;
            contentHeight += layout.height;
            contentWidth += layout.width;
          });

          this._contentWidth = contentWidth

          this.setState({
            containerLayout: {x, y, width, height, pageX, pageY},
            rowsLayouts: rowsLayoutsByKey,
            footerLayout,
            contentHeight,
          }, () => {
            this.setState({animated: true});
          });
        });
      });
  }

  _scroll(animated) {
    this._scrollView.scrollTo({...this._contentOffset, animated});
  }

  /**
   * Finds a row under the moving row, if they are neighbours,
   * swaps them, else shifts rows.
   */
  _setOrderOnMove() {
    const {activeRowKey, activeRowIndex/*, order*/} = this.state;
    let order = this._order

    if (activeRowKey === null || this._autoScrollInterval) {
      return;
    }

    let {
      rowKey: rowUnderActiveKey,
      rowIndex: rowUnderActiveIndex,
    } = this._findRowUnderActiveRow();

    if (this._movingDirectionChanged) {
      this._prevSwapedRowKey = null;
    }

    // Swap rows if necessary.
    if (rowUnderActiveKey !== activeRowKey && rowUnderActiveKey !== this._prevSwapedRowKey) {
      const isNeighbours = Math.abs(rowUnderActiveIndex - activeRowIndex) === 1;
      let nextOrder;

      // If they are neighbours, swap elements, else shift.
      if (isNeighbours) {
        this._prevSwapedRowKey = rowUnderActiveKey;
        nextOrder = swapArrayElements(order, activeRowIndex, rowUnderActiveIndex);
      } else {
        nextOrder = order.slice();
        nextOrder.splice(activeRowIndex, 1);
        nextOrder.splice(rowUnderActiveIndex, 0, activeRowKey);
      }

      this._order = nextOrder
      this.setState({
        order: nextOrder,
        activeRowIndex: rowUnderActiveIndex,
      }, () => {
        if (this.props.onChangeOrder) {
          this.props.onChangeOrder(nextOrder);
        }
      });
    }
  }

  /**
   * Finds a row, which was covered with the moving row’s half.
   */
  _findRowUnderActiveRow() {
    let order = this._order
    const {horizontal} = this.props;
    const {rowsLayouts, activeRowKey, activeRowIndex/*, order*/} = this.state;
    const movingRowLayout = rowsLayouts[activeRowKey];
    const rowLeftX = this._activeRowLocation.x
    const rowRightX = rowLeftX + movingRowLayout.width;
    const rowTopY = this._activeRowLocation.y;
    const rowBottomY = rowTopY + movingRowLayout.height;

    for (
      let currentRowIndex = 0, x = 0, y = 0, rowsCount = order.length;
      currentRowIndex < rowsCount - 1;
      currentRowIndex++
    ) {
      const currentRowKey = order[currentRowIndex];
      const currentRowLayout = rowsLayouts[currentRowKey];
      const nextRowIndex = currentRowIndex + 1;
      const nextRowLayout = rowsLayouts[order[nextRowIndex]];

      x += currentRowLayout.width;
      y += currentRowLayout.height;

      if (currentRowKey !== activeRowKey && (
        horizontal
          ? ((x - currentRowLayout.width <= rowLeftX || currentRowIndex === 0) && rowLeftX <= x - currentRowLayout.width / 3)
          : ((y - currentRowLayout.height <= rowTopY || currentRowIndex === 0) && rowTopY <= y - currentRowLayout.height / 3)
      )) {
        return {
          rowKey: order[currentRowIndex],
          rowIndex: currentRowIndex,
        };
      }

      if (horizontal
        ? (x + nextRowLayout.width / 3 <= rowRightX && (rowRightX <= x + nextRowLayout.width || nextRowIndex === rowsCount - 1))
        : (y + nextRowLayout.height / 3 <= rowBottomY && (rowBottomY <= y + nextRowLayout.height || nextRowIndex === rowsCount - 1))
      ) {
        return {
          rowKey: order[nextRowIndex],
          rowIndex: nextRowIndex,
        };
      }
    }

    return {rowKey: activeRowKey, rowIndex: activeRowIndex};
  }

  _scrollOnMove(e) {
    const {pageX, pageY} = e.nativeEvent;
    const {horizontal} = this.props;
    const {containerLayout} = this.state;
    let inAutoScrollBeginArea = false;
    let inAutoScrollEndArea = false;

    if (horizontal) {
      inAutoScrollBeginArea = pageX < containerLayout.pageX + this.props.autoscrollAreaSize;
      inAutoScrollEndArea = pageX > containerLayout.pageX + containerLayout.width - this.props.autoscrollAreaSize;
    } else {
      inAutoScrollBeginArea = pageY < containerLayout.pageY + this.props.autoscrollAreaSize;
      inAutoScrollEndArea = pageY > containerLayout.pageY + containerLayout.height - this.props.autoscrollAreaSize;
    }

    if (!inAutoScrollBeginArea &&
      !inAutoScrollEndArea &&
      this._autoScrollInterval !== null
    ) {
      this._stopAutoScroll();
    }

    // It should scroll and scrolling is processing.
    if (this._autoScrollInterval !== null) {
      return;
    }

    if (inAutoScrollBeginArea) {
      this._startAutoScroll({
        direction: -1,
        shouldScroll: () => this._contentOffset[horizontal ? 'x' : 'y'] > 0,
        getScrollStep: (stepIndex) => {
          const nextStep = this._getScrollStep(stepIndex);
          const contentOffset = this._contentOffset[horizontal ? 'x' : 'y'];

          return contentOffset - nextStep < 0 ? contentOffset : nextStep;
        },
      });
    } else if (inAutoScrollEndArea) {
      this._startAutoScroll({
        direction: 1,
        shouldScroll: () => {
          const {
            contentHeight,
            containerLayout,
            footerLayout = {height: 0},
          } = this.state;

          let contentWidth = this._contentWidth

          if (horizontal) {
            return this._contentOffset.x < contentWidth - containerLayout.width
          } else {
            return this._contentOffset.y < contentHeight + footerLayout.height - containerLayout.height;
          }
        },
        getScrollStep: (stepIndex) => {
          const nextStep = this._getScrollStep(stepIndex);
          const {
            contentHeight,
            containerLayout,
            footerLayout = {height: 0},
          } = this.state;
          
          let contentWidth = this._contentWidth

          if (horizontal) {
            return this._contentOffset.x + nextStep > contentWidth - containerLayout.width
              ? contentWidth - containerLayout.width - this._contentOffset.x
              : nextStep;
          } else {
            const scrollHeight = contentHeight + footerLayout.height - containerLayout.height;

            return this._contentOffset.y + nextStep > scrollHeight
              ? scrollHeight - this._contentOffset.y
              : nextStep;
          }
        },
      });
    }
  }

  _getScrollStep(stepIndex) {
    return stepIndex > 3 ? 60 : 30;
  }

  _startAutoScroll({direction, shouldScroll, getScrollStep}) {
    if (!shouldScroll()) {
      return;
    }

    const {activeRowKey} = this.state;
    const {horizontal} = this.props;
    let counter = 0;

    this._autoScrollInterval = setInterval(() => {
      if (shouldScroll()) {
        const movement = {
          [horizontal ? 'dx' : 'dy']: direction * getScrollStep(counter++),
        };

        this.scrollBy(movement);
        this._rows[activeRowKey].moveBy(movement);
      } else {
        this._stopAutoScroll();
      }
    }, AUTOSCROLL_INTERVAL);
  }

  _stopAutoScroll() {
    clearInterval(this._autoScrollInterval);
    this._autoScrollInterval = null;
  }

  _onLayoutRow(rowKey, {nativeEvent: {layout}}) {
    this._resolveRowLayout[rowKey]({rowKey, layout});
  }

  _onLayoutFooter = ({nativeEvent: {layout}}) => {
    this._resolveFooterLayout(layout);
  };

  _onActivateRow = (rowKey, index, e, gestureState, location) => {
    console.log('_onActivateRow')
    this._activeRowLocation = location;

    index = this._order.indexOf(rowKey) /* */

    this.setState({
      activeRowKey: rowKey,
      activeRowIndex: index,
      releasedRowKey: null,
      scrollEnabled: false,
    });

    if (this.props.onActivateRow) {
      this.props.onActivateRow(rowKey);
    }
  };

  _onPressRow = (rowKey) => {
    if (this.props.onPressRow) {
      this.props.onPressRow(rowKey);
    }
  };

  _onReleaseRow = (rowKey) => {
    this._stopAutoScroll();
    this.setState(({activeRowKey}) => ({
      activeRowKey: null,
      activeRowIndex: null,
      releasedRowKey: activeRowKey,
      scrollEnabled: this.props.scrollEnabled,
    }));

    if (this.props.onReleaseRow) {
      this.props.onReleaseRow(rowKey);
    }
  };

  _onMoveRow = (e, gestureState, location) => {
    const prevMovingRowX = this._activeRowLocation.x;
    const prevMovingRowY = this._activeRowLocation.y;
    const prevMovingDirection = this._movingDirection;

    this._activeRowLocation = location;
    this._movingDirection = this.props.horizontal
      ? prevMovingRowX < this._activeRowLocation.x
      : prevMovingRowY < this._activeRowLocation.y;

    this._movingDirectionChanged = prevMovingDirection !== this._movingDirection;
    this._setOrderOnMove();

    if (this.props.scrollEnabled) {
      this._scrollOnMove(e);
    }
  };

  _onScroll = ({nativeEvent: {contentOffset}}) => {
      this._contentOffset = contentOffset;
  };

  _onRefContainer = (component) => {
    this._container = component;
  };

  _onRefScrollView = (component) => {
    this._scrollView = component;
  };

  _onRefRow = (rowKey, component) => {
    this._rows[rowKey] = component;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  rowsContainer: {
    flex: 1,
    zIndex: 1,
  },
});
