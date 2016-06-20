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

var _ReferenceableContainer = require('./ReferenceableContainer.jsx');

var _ReferenceableContainer2 = _interopRequireDefault(_ReferenceableContainer);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function makeSelectable(Component) {
  var _class, _temp;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var _options$sorter = options.sorter;
  var sorter = _options$sorter === undefined ? function (a, b) {
    return a - b;
  } : _options$sorter;
  var _options$nodevalue = options.nodevalue;
  var nodevalue = _options$nodevalue === undefined ? function (node) {
    return node.props.value;
  } : _options$nodevalue;
  // always force a containerDiv if a stateless functional component is passed in

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
        selectedNodes: {},
        selectedNodeList: [],
        selectedValues: {},
        selectedValueList: []
      };
      _this.selectionManager = new _SelectionManager2.default(_this, props);
      _this.makeInputManager = _this.makeInputManager.bind(_this);
      return _this;
    }

    _createClass(_class, [{
      key: 'updateState',
      value: function updateState(selecting, nodes, values) {
        var _this2 = this;

        if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
          _debug2.default.log('updatestate: ', selecting, nodes, values);
        }
        var newnodes = nodes === null ? this.state.selectedNodes : nodes;
        var newvalues = values === null ? this.state.selectedValues : values;
        this.setState({
          selecting: selecting === null ? this.state.selecting : selecting,
          selectedNodes: newnodes,
          selectedValues: newvalues,
          containerBounds: this.bounds
        });
        if (this.props.selectionCallbacks.onSelectItem && this.props.selectionOptions.constant) {
          (function () {
            var nodelist = Object.keys(newnodes).map(function (key) {
              return newnodes[key];
            }).sort(function (a, b) {
              return nodevalue(a.node) - nodevalue(b.node);
            });
            var valuelist = Object.keys(newvalues).map(function (key) {
              return newvalues[key];
            }).sort(sorter);
            if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
              _debug2.default.log('updatestate onSelectItem', values, nodes, valuelist, nodelist, _this2.bounds);
            }
            if (_this2.props.onSelectSlot) {
              _this2.props.onSelectSlot(values, function () {
                return nodes;
              }, valuelist, function () {
                return nodelist;
              }, _this2.bounds);
            }
          })();
        }
      }
    }, {
      key: 'propagateFinishedSelect',
      value: function propagateFinishedSelect() {
        if (!this.props.selectionCallbacks.onFinishSelect) return;
        var newnodes = this.state.selectedNodes;
        var newvalues = this.state.selectedValues;
        var nodelist = Object.keys(newnodes).map(function (key) {
          return newnodes[key];
        }).sort(function (a, b) {
          return sorter(nodevalue(a.node), nodevalue(b.node));
        });
        var valuelist = Object.keys(newvalues).map(function (key) {
          return newvalues[key];
        }).sort(sorter);
        if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
          _debug2.default.log('finishselect', newvalues, newnodes, valuelist, nodelist, this.bounds);
        }
        this.props.onFinishSelect(newvalues, function () {
          return newnodes;
        }, valuelist, function () {
          return nodelist;
        }, this.bounds);
      }
    }, {
      key: 'getChildContext',
      value: function getChildContext() {
        return {
          selectionManager: this.selectionManager,
          selectedNodes: this.state.selectedNodes,
          selectedValues: this.state.selectedValues
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
        if (this.props.selectionOptions.constant) {
          this.selectionManager.select(selectionRectangle, this.state, this.props);
        } else {
          this.selectionManager.deselect(this.state);
        }
      }
    }, {
      key: 'cancel',
      value: function cancel() {
        this.selectionManager.deselect(this.state);
        this.propagateFinishedSelect();
        this.setState({ selecting: false });
      }
    }, {
      key: 'end',
      value: function end(e, mouseDownData, selectionRectangle) {
        if (this.props.selectionOptions.constant && !this.props.selectionOptions.preserve) {
          this.propagateFinishedSelect();
          this.selectionManager.deselect(this.state);
          return;
        }
        this.selectionManager.select(selectionRectangle, this.state, this.props);
        this.propagateFinishedSelect();
      }
    }, {
      key: 'change',
      value: function change(selectionRectangle) {
        var old = this.state.selecting;

        if (!old) {
          this.setState({ selecting: true });
        }

        if (this.props.selectionOptions.constantSelect) {
          this.selectionManager.select(selectionRectangle, this.state, this.props);
        }
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
    constantSelect: _react.PropTypes.bool,
    selectable: _react.PropTypes.bool,
    preserveSelection: _react.PropTypes.bool,
    selectIntermediates: _react.PropTypes.bool,
    onSelectSlot: _react.PropTypes.func,
    onFinishSelect: _react.PropTypes.func,
    onMouseDown: _react.PropTypes.func,
    onTouchStart: _react.PropTypes.func
  }, _class.defaultProps = {
    clickTolerance: 2,
    constantSelect: false,
    selectable: false,
    preserveSelection: false,
    selectIntermediates: false
  }, _class.childContextTypes = {
    selectionManager: _react.PropTypes.object,
    selectedNodes: _react.PropTypes.object,
    selectedValues: _react.PropTypes.object
  }, _temp;
}

exports.default = makeSelectable;
module.exports = exports['default'];