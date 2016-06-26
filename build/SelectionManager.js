'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDom = require('react-dom');

var _mouseMath = require('./mouseMath.js');

var _mouseMath2 = _interopRequireDefault(_mouseMath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectionManager = function () {
  function SelectionManager(notify, list, props) {
    _classCallCheck(this, SelectionManager);

    this.selectedList = list;
    this.clickTolerance = props.clickTolerance;
    this.selecting = false;
    this.selectables = {};
    this.sortedNodes = [];
    this.indexMap = {};
    this.notify = notify;
  }

  _createClass(SelectionManager, [{
    key: 'registerSelectable',
    value: function registerSelectable(component, _ref) {
      var key = _ref.key;
      var value = _ref.value;
      var types = _ref.types;
      var selectable = _ref.selectable;
      var callback = _ref.callback;
      var cacheBounds = _ref.cacheBounds;
      var mouse = arguments.length <= 2 || arguments[2] === undefined ? _mouseMath2.default : arguments[2];
      var findit = arguments.length <= 3 || arguments[3] === undefined ? _reactDom.findDOMNode : arguments[3];

      if (key === undefined) {
        throw new Error('component registered with undefined key, value is ' + JSON.stringify(value));
      }
      var bounds = cacheBounds ? mouse.getBoundsForNode(findit(component)) : null;
      var info = { component: component, selectable: selectable, key: key, value: value, types: types, callback: callback, bounds: bounds };
      if (this.selectables.hasOwnProperty(key)) {
        // this allows us to dynamically update a component if it changes
        // its type, or its value
        this.sortedNodes[this.indexMap[key]] = info;
      } else {
        this.indexMap[key] = this.sortedNodes.length;
        this.sortedNodes.push(info);
      }
      this.selectables[key] = info;
    }
  }, {
    key: 'unregisterSelectable',
    value: function unregisterSelectable(component, key) {
      delete this.selectables[key];
      var index = this.indexMap[key];
      this.sortedNodes = this.sortedNodes.filter(function (item) {
        return item.key !== key;
      });
      this.selectedList.setNodes(this.sortedNodes);
      if (this.selectedList.selectedIndices.indexOf(index) !== -1) {
        this.selectedList.selectedIndices.splice(index, 1);
        this.notify.updateState(null);
      }
    }
  }, {
    key: 'select',
    value: function select(_ref2) {
      var selectionRectangle = _ref2.selectionRectangle;
      var props = _ref2.props;
      var findit = arguments.length <= 1 || arguments[1] === undefined ? _reactDom.findDOMNode : arguments[1];
      var mouse = arguments.length <= 2 || arguments[2] === undefined ? _mouseMath2.default : arguments[2];

      return this.selectedList.selectItemsInRectangle(selectionRectangle, props, findit, mouse);
    }
  }, {
    key: 'cancelSelection',
    value: function cancelSelection(_ref3) {
      var indices = _ref3.indices;
      var nodes = _ref3.nodes;

      if (indices) {
        return this.selectedList.cancelIndices(indices);
      }
      if (nodes) {
        return this.selectedList.removeNodes(nodes);
      }
    }
  }, {
    key: 'deselect',
    value: function deselect() {
      if (!this.selectedList.clear()) return;
    }
  }, {
    key: 'begin',
    value: function begin(props) {
      this.selectedList.begin(props.selectionOptions.additive ? this.selectedList.selectedIndices : [], props);
      this.selecting = true;
    }
  }, {
    key: 'commit',
    value: function commit() {
      this.selectedList.commit();
      this.selecting = false;
    }
  }, {
    key: 'isSelecting',
    value: function isSelecting() {
      return this.selecting;
    }
  }]);

  return SelectionManager;
}();

exports.default = SelectionManager;
module.exports = exports['default'];