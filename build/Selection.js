'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('./debug.js');

var _debug2 = _interopRequireDefault(_debug);

var _InputManager = require('./InputManager.js');

var _InputManager2 = _interopRequireDefault(_InputManager);

var _SelectionManager = require('./SelectionManager.js');

var _SelectionManager2 = _interopRequireDefault(_SelectionManager);

var _verifyComponent = require('./verifyComponent.js');

var _verifyComponent2 = _interopRequireDefault(_verifyComponent);

var _selectedList = require('./selectedList.js');

var _selectedList2 = _interopRequireDefault(_selectedList);

var _ReferenceableContainer = require('./ReferenceableContainer.jsx');

var _ReferenceableContainer2 = _interopRequireDefault(_ReferenceableContainer);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _mouseMath = require('./mouseMath.js');

var _mouseMath2 = _interopRequireDefault(_mouseMath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeSelectable(Component) {
  var _class, _temp;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  // always force a ReferenceableContainer if a stateless functional component is passed in
  var useContainer = (0, _verifyComponent2.default)(Component);
  var componentDisplayName = Component.displayName || Component.name || 'Component';
  var displayName = void 0;
  var ReferenceableContainer = void 0;
  if (useContainer) {
    displayName = 'Selection(ReferenceableContainer(' + componentDisplayName + '))';
    ReferenceableContainer = (0, _ReferenceableContainer2.default)(Component, componentDisplayName);
  } else {
    displayName = 'Selection(' + componentDisplayName + ')';
  }

  return _temp = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class(props) {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, props));

      _this.state = {
        selecting: false,
        selectedIndices: []
      };
      _this.selectedList = new _selectedList2.default();
      _this.selectionManager = new _SelectionManager2.default(_this, _this.selectedList, props);
      _this.makeInputManager = _this.makeInputManager.bind(_this);
      _this.cancelSelection = _this.cancelSelection.bind(_this);
      return _this;
    }

    _createClass(_class, [{
      key: 'updateState',
      value: function updateState(selecting) {
        if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
          _debug2.default.log('updatestate: ', selecting);
        }
        var onSelectionChange = this.props.selectionCallbacks.onSelectionChange;
        if (onSelectionChange && this.props.selectionOptions.constant && this.selectionManager.isSelecting()) {
          var result = onSelectionChange(this.selectedList.removed, this.selectedList.added, this.selectedList);
          if (!result) {
            this.selectedList.revert();
          } else if (result !== true) {
            this.selectedList.setSelection(result);
          }
        }
        // we are ok to notify
        this.selectedList.notifyChangedNodes();

        this.setState({
          selecting: selecting === null ? this.state.selecting : selecting,
          selectedIndices: [].concat(_toConsumableArray(this.selectedList.selectedIndices)),
          containerBounds: this.bounds
        });
        return true;
      }
    }, {
      key: 'cancelSelection',
      value: function cancelSelection(items) {
        this.selectionManager.cancelSelection(items);
      }
    }, {
      key: 'propagateFinishedSelect',
      value: function propagateFinishedSelect() {
        if (!this.props.selectionCallbacks.onFinishSelect) return;
        if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
          _debug2.default.log('finishselect', this.state.selectedIndices, this.bounds);
        }
        this.props.selectionCallbacks.onFinishSelect(this.state.selectedIndices, this.selectedList, this.bounds);
      }
    }, {
      key: 'getChildContext',
      value: function getChildContext() {
        return {
          selectionManager: this.selectionManager,
          selectedIndices: this.state.selectedIndices,
          nodeList: this.selectedList
        };
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        if (this.inputManager) {
          this.inputManager.unmount();
        }
      }
    }, {
      key: 'invalid',
      value: function invalid(e, eventname) {
        if (eventname === 'touchstart') {
          if (this.props.onTouchStart) {
            this.props.onTouchStart(e);
          }
        } else {
          if (this.props.onMouseDown) {
            this.props.onMouseDown(e);
          }
        }
      }
    }, {
      key: 'start',
      value: function start(bounds, mouseDownData, selectionRectangle) {
        this.bounds = bounds;
        this.mouseDownData = mouseDownData;
        if (!this.props.selectionOptions.additive) {
          this.selectionManager.deselect();
        }
        this.selectionManager.begin(this.props);
        if (this.props.selectionOptions.constant) {
          if (this.selectionManager.select({ selectionRectangle: selectionRectangle, props: this.props })) {
            this.updateState(null);
          }
        }
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.selectionManager.commit();
        this.selectionManager.deselect();
        this.setState({ selecting: false });
      }
    }, {
      key: 'end',
      value: function end(e, mouseDownData, selectionRectangle) {
        if (this.props.selectionOptions.constant && !(this.props.selectionOptions.preserve || this.props.selectionOptions.additive)) {
          this.propagateFinishedSelect();
          this.selectionManager.commit();
          this.selectionManager.deselect();
          this.updateState(false);
          this.setState({ selecting: false });
          return;
        }
        this.selectionManager.select({ selectionRectangle: selectionRectangle, props: this.props });
        if (this.updateState(null)) {
          this.propagateFinishedSelect();
        }
        this.selectionManager.commit();
        this.setState({ selecting: false });
      }
    }, {
      key: 'change',
      value: function change(selectionRectangle) {
        var findit = arguments.length <= 1 || arguments[1] === undefined ? _reactDom.findDOMNode : arguments[1];
        var mouse = arguments.length <= 2 || arguments[2] === undefined ? _mouseMath2.default : arguments[2];

        var old = this.state.selecting;

        if (!old) {
          this.setState({ selecting: true });
        }

        if (this.props.selectionOptions.constant) {
          if (this.selectionManager.select({ selectionRectangle: selectionRectangle, props: this.props }, findit, mouse)) {
            if (!this.updateState(null)) {
              this.cancel();
            }
          }
        }
      }
    }, {
      key: 'click',
      value: function click(e, mouseDownData, selectionRectangle) {
        this.end(e, mouseDownData, selectionRectangle);
      }
    }, {
      key: 'makeInputManager',
      value: function makeInputManager(ref) {
        var inputManager = arguments.length <= 1 || arguments[1] === undefined ? _InputManager2.default : arguments[1];

        if (!ref) return;
        if (this.ref === ref) return;
        if (this.inputManager) this.inputManager.unmount();
        this.ref = ref;
        this.inputManager = new inputManager(ref, this, this);
      }
    }, {
      key: 'render',
      value: function render() {
        if (useContainer) {
          return _react2.default.createElement(ReferenceableContainer, _extends({}, this.props, this.state, {
            ref: this.makeInputManager
          }));
        }
        return _react2.default.createElement(Component, _extends({}, this.props, this.state, {
          ref: this.makeInputManager
        }));
      }
    }]);

    return _class;
  }(_react2.default.Component), _class.displayName = displayName, _class.propTypes = {
    clickTolerance: _react.PropTypes.number,
    selectionOptions: _react.PropTypes.shape({
      constant: _react.PropTypes.bool,
      additive: _react.PropTypes.bool,
      selectable: _react.PropTypes.bool,
      preserve: _react.PropTypes.bool,
      inBetween: _react.PropTypes.bool,
      acceptedTypes: _react.PropTypes.array
    }),
    selectionCallbacks: _react.PropTypes.shape({
      onSelectionChange: _react.PropTypes.func,
      onFinishSelect: _react.PropTypes.func,
      onSelectStart: _react.PropTypes.func
    }),
    onMouseDown: _react.PropTypes.func,
    onTouchStart: _react.PropTypes.func
  }, _class.defaultProps = {
    clickTolerance: 2,
    selectionOptions: {
      constant: false,
      selectable: false,
      preserve: false,
      inBetween: false
    },
    selectionCallbacks: {}
  }, _class.childContextTypes = {
    selectionManager: _react.PropTypes.object,
    selectedIndices: _react.PropTypes.array,
    nodeList: _react.PropTypes.object
  }, _temp;
}

exports.default = makeSelectable;
module.exports = exports['default'];