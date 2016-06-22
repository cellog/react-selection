'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ReferenceableContainer = require('./ReferenceableContainer.jsx');

var _ReferenceableContainer2 = _interopRequireDefault(_ReferenceableContainer);

var _verifyComponent = require('./verifyComponent.js');

var _verifyComponent2 = _interopRequireDefault(_verifyComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint react/no-multi-comp:0 */


function Selectable(Component, options) {
  var _class, _temp;

  var useContainer = (0, _verifyComponent2.default)(Component);
  var componentDisplayName = Component.displayName || Component.name || 'Component';
  var displayName = void 0;
  var ReferenceableContainer = void 0;
  if (useContainer) {
    displayName = 'Selectable(ReferenceableContainer(' + componentDisplayName + '))';
    ReferenceableContainer = (0, _ReferenceableContainer2.default)(Component, componentDisplayName);
  } else {
    displayName = 'Selectable(' + componentDisplayName + ')';
  }
  var unregister = function unregister() {
    return null;
  };
  return _temp = _class = function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class(props, context) {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, props, context));

      _this.state = {
        selected: false,
        selectable: options.selectable ? options.selectable(props) : true
      };
      _this.selectItem = _this.selectItem.bind(_this);
      _this.changeSelectable = _this.changeSelectable.bind(_this);
      return _this;
    }

    _createClass(_class, [{
      key: 'componentWillReceiveProps',
      value: function componentWillReceiveProps(props) {
        this.register(props);
        if (options.selectable) {
          this.setState({ selectable: options.selectable(props) });
        }
      }
    }, {
      key: 'register',
      value: function register(props) {
        this.context.selectionManager.registerSelectable(this, {
          key: options.key(this.props),
          selectable: options.selectable ? options.selectable(props) : true,
          types: options.types ? options.types : ['default'],
          value: options.value(props),
          callback: this.selectItem,
          cacheBounds: options.cacheBounds
        });
      }
    }, {
      key: 'componentDidMount',
      value: function componentDidMount() {
        if (!this.context || !this.context.selectionManager) return;
        var key = options.key(this.props);
        this.register(this.props);
        unregister = this.context.selectionManager.unregisterSelectable.bind(this.context.selectionManager, this, key);
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        unregister();
        unregister = function unregister() {
          return null;
        };
      }
    }, {
      key: 'selectItem',
      value: function selectItem(value) {
        this.setState({ selected: value });
      }
    }, {
      key: 'changeSelectable',
      value: function changeSelectable(selectable) {
        this.context.selectionManager.changeSelectable(options.key(this.props), selectable);
        this.setState({ selectable: selectable });
      }
    }, {
      key: 'render',
      value: function render() {
        if (useContainer) {
          return _react2.default.createElement(ReferenceableContainer, _extends({}, this.props, this.state, { changeSelectable: this.changeSelectable }));
        }
        return _react2.default.createElement(Component, _extends({}, this.props, this.state, { changeSelectable: this.changeSelectable }));
      }
    }]);

    return _class;
  }(_react2.default.Component), _class.displayName = displayName, _class.contextTypes = {
    selectionManager: _react.PropTypes.object
  }, _temp;
}

exports.default = Selectable;
module.exports = exports['default'];