'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mouseMath = require('./mouseMath.js');

var _mouseMath2 = _interopRequireDefault(_mouseMath);

var _debug = require('./debug.js');

var _debug2 = _interopRequireDefault(_debug);

var _reactDom = require('react-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SelectionManager = function () {
  function SelectionManager(notify, props) {
    _classCallCheck(this, SelectionManager);

    this.clickTolerance = props.clickTolerance;
    this.selectables = {};
    this.selectableKeys = [];
    this.sortedNodes = [];
    this.selectedNodes = {};
    this.selectedValues = {};
    this.notify = notify;
  }

  _createClass(SelectionManager, [{
    key: 'registerSelectable',
    value: function registerSelectable(component, key, value, callback, cacheBounds) {
      var mouse = arguments.length <= 5 || arguments[5] === undefined ? _mouseMath2.default : arguments[5];
      var findit = arguments.length <= 6 || arguments[6] === undefined ? _reactDom.findDOMNode : arguments[6];

      var bounds = cacheBounds ? mouse.getBoundsForNode(findit(component)) : null;
      if (!this.selectables.hasOwnProperty(key)) {
        this.selectableKeys.push(key);
        this.sortedNodes.push({ component: component, key: key, value: value, callback: callback, bounds: bounds });
      }
      if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.registration) {
        _debug2.default.log('registered: ' + key, value);
      }
      this.selectables[key] = { component: component, value: value, callback: callback, bounds: bounds };
    }
  }, {
    key: 'unregisterSelectable',
    value: function unregisterSelectable(component, key) {
      delete this.selectables[key];
      this.selectableKeys = this.selectableKeys.filter(function (itemKey) {
        return itemKey !== key;
      });
      this.sortedNodes = this.sortedNodes.filter(function (item) {
        return item.key !== key;
      });
      if (this.selectedNodes[key]) {
        var nodes = this.selectedNodes;
        var values = this.selectedValues;
        delete nodes[key];
        delete values[key];
        this.notify.updateState(null, nodes, values);
      }
    }
  }, {
    key: 'saveNode',
    value: function saveNode(changedNodes, node, bounds) {
      if (this.selectedNodes[node.key] !== undefined) return;
      if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
        _debug2.default.log('select: ' + node.key);
      }
      this.selectedNodes[node.key] = { node: node.component, bounds: bounds };
      this.selectedValues[node.key] = node.value;
      changedNodes.push([true, node]);
    }
  }, {
    key: 'walkNodes',
    value: function walkNodes(selectionRectangle, selectedIndices, changedNodes, findit, mouse, node, idx) {
      var domnode = findit(node.component);
      var key = node.key;
      var bounds = node.bounds ? node.bounds : mouse.getBoundsForNode(domnode);
      if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.bounds) {
        _debug2.default.log('node ' + key + ' bounds', bounds);
      }
      if (!domnode || !mouse.objectsCollide(selectionRectangle, bounds, this.clickTolerance, key)) {
        if (!this.selectedNodes.hasOwnProperty(key)) return;
        if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
          _debug2.default.log('deselect: ' + key);
        }
        delete this.selectedNodes[key];
        delete this.selectedValues[key];
        changedNodes.push([false, node]);
        return;
      }
      selectedIndices.push(idx);
      this.saveNode(changedNodes, node, bounds);
    }
  }, {
    key: 'select',
    value: function select(selectionRectangle, currentState, props) {
      var _this = this;

      var findit = arguments.length <= 3 || arguments[3] === undefined ? _reactDom.findDOMNode : arguments[3];
      var mouse = arguments.length <= 4 || arguments[4] === undefined ? _mouseMath2.default : arguments[4];

      this.selectedNodes = currentState.selectedNodes;
      this.selectedValues = currentState.selectedValues;
      var changedNodes = [];
      var selectedIndices = [];

      this.sortedNodes.forEach(this.walkNodes.bind(this, selectionRectangle, selectedIndices, changedNodes, findit, mouse), this);
      if (props.selectIntermediates) {
        (function () {
          var min = Math.min.apply(Math, selectedIndices);
          var max = Math.max.apply(Math, selectedIndices);
          var filled = Array.apply(min, Array(max - min)).map(function (x, y) {
            return min + y + 1;
          });
          filled.unshift(min);
          var diff = filled.filter(function (val) {
            return selectedIndices.indexOf(val) === -1;
          });
          diff.forEach(function (idx) {
            return _this.saveNode(changedNodes, _this.sortedNodes[idx], _this.sortedNodes[idx].bounds ? _this.sortedNodes[idx].bounds : mouse.getBoundsForNode(findit(_this.sortedNodes[idx].component)));
          });
        })();
      }
      if (changedNodes.length) {
        changedNodes.forEach(function (item) {
          item[1].callback(item[0], _this.selectedNodes, _this.selectedValues);
        });
        this.notify.updateState(null, this.selectedNodes, this.selectedValues);
      }
    }
  }, {
    key: 'deselect',
    value: function deselect(currentState) {
      var _this2 = this;

      var changed = false;
      Object.keys(currentState.selectedNodes).forEach(function (key) {
        changed = true;
        _this2.selectables[key].callback(false, {}, {});
      });
      if (changed) {
        this.selectedNodes = {};
        this.selectedValues = {};
        this.notify.updateState(false, {}, {});
      }
    }
  }]);

  return SelectionManager;
}();

exports.default = SelectionManager;
module.exports = exports['default'];