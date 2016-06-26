'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDom = require('react-dom');

var _mouseMath = require('./mouseMath.js');

var _mouseMath2 = _interopRequireDefault(_mouseMath);

var _debug = require('./debug.js');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var selectList = function () {
  function selectList() {
    _classCallCheck(this, selectList);

    this.nodes = [];
    this.bounds = [];
    this.indices = {};
    this.selectedIndices = [];
    this.removed = [];
    this.added = [];
    this.transaction = {};

    var _this = this;
    this.accessor = {
      nodes: function nodes() {
        return [].concat(_toConsumableArray(_this.nodes));
      },
      node: function node(idx) {
        return _this.nodes[idx];
      },
      nodeIndicesOfType: function nodeIndicesOfType(types) {
        var mytypes = [].concat(types);
        return _this.nodes.filter(function (node) {
          return mytypes.every(function (type) {
            return node.types.indexOf(type) !== -1;
          });
        }).map(function (node) {
          return _this.nodes.indexOf(node);
        });
      },
      selectedIndices: function selectedIndices() {
        return [].concat(_toConsumableArray(_this.selectedIndices));
      },
      selectedNodeList: function selectedNodeList() {
        return _this.selectedIndices.map(function (idx) {
          return _this.nodes[idx].component;
        });
      },
      selectedValueList: function selectedValueList() {
        return _this.selectedIndices.map(function (idx) {
          return _this.nodes[idx].value;
        });
      },
      selectedNodes: function selectedNodes() {
        return _this.selectedIndices.reduce(function (val, idx) {
          val[_this.nodes[idx].key] = {
            node: _this.nodes[idx].component,
            bounds: _this.bounds[idx]
          };
          return val;
        }, {});
      },
      selectedValues: function selectedValues() {
        return _this.selectedIndices.reduce(function (val, idx) {
          val[_this.nodes[idx].key] = _this.nodes[idx].value;
          return val;
        }, {});
      }
    };
  }

  _createClass(selectList, [{
    key: 'setNodes',
    value: function setNodes(nodes) {
      var _this2 = this;

      this.nodes = nodes;
      this.nodes.forEach(function (node, idx) {
        return _this2.indices[node.key] = idx;
      });
    }
  }, {
    key: 'begin',
    value: function begin(selectedIndices, props) {
      this.transaction = {
        previousSelection: [].concat(_toConsumableArray(selectedIndices)),
        mostRecentSelection: [].concat(_toConsumableArray(selectedIndices)),
        additionalSelectionMap: {},
        firstNode: false
      };

      this.selectedIndices = [];
      this.removed = [];
      this.added = [];
      this.props = props;
    }
  }, {
    key: 'commit',
    value: function commit() {
      this.transaction = {};
    }
  }, {
    key: 'addItem',
    value: function addItem(idx) {
      var selectedIndices = arguments.length <= 1 || arguments[1] === undefined ? this.selectedIndices : arguments[1];

      if (!this.transaction.firstNode) {
        this.transaction.firstNode = this.nodes[idx];
      }
      var si = selectedIndices;
      // determine how to insert the value prior to insertion sort
      if (!si.length || idx > si[si.len - 1]) {
        si.push(idx);
        return;
      }
      if (idx < si[0]) {
        si.unshift(idx);
        return;
      }
      var len = si.length;
      // if the index is closer to one end than the other, start there
      if (si[len - 1] - idx <= idx - si[0]) {
        si.push(idx);
        var curIdx = len;
        // insertion sort from end
        while (curIdx >= 1 && si[curIdx - 1] > idx) {
          si[curIdx] = si[curIdx - 1];
          si[--curIdx] = idx;
        }
      } else {
        si.unshift(idx);
        var _curIdx = 0;
        // insertion sort from start
        while (_curIdx <= len && si[_curIdx + 1] < idx) {
          si[_curIdx] = si[_curIdx + 1];
          si[++_curIdx] = idx;
        }
      }
    }
  }, {
    key: 'removeItem',
    value: function removeItem(idx) {
      var index = this.selectedIndices.indexOf(idx);
      if (index === -1) return;
      this.selectedIndices.splice(index, 1);
    }
  }, {
    key: 'selectItem',
    value: function selectItem(idx) {
      // first check to see if this index is the same type as the first node selected
      var node = this.nodes[idx];
      if (!node.selectable) return;
      if (this.props.hasOwnProperty('acceptedTypes')) {
        // by default we accept all types, this prop restricts types accepted
        if (!this.props.acceptedTypes.reduce(function (last, type) {
          return last || node.types.indexOf(type) !== -1;
        }, false)) {
          return;
        }
      }
      if (this.transaction.firstNode) {
        // does this node share any types in common with the first selected node?
        if (!this.transaction.firstNode.types.reduce(function (last, type) {
          return last || node.types.indexOf(type) !== -1;
        }, false)) {
          // no
          return;
        }
      }
      if (this.selectedIndices.indexOf(idx) !== -1) return;
      this.addItem(idx);
    }
  }, {
    key: 'deselectItem',
    value: function deselectItem(idx) {
      this.removeItem(idx);
    }
  }, {
    key: 'testNodes',
    value: function testNodes(_ref, node, idx) {
      var selectionRectangle = _ref.selectionRectangle;
      var props = _ref.props;
      var findit = _ref.findit;
      var mouse = _ref.mouse;

      var bounds = void 0;
      if (node.bounds) {
        bounds = node.bounds;
      } else {
        var domnode = findit(node.component);
        bounds = domnode ? mouse.getBoundsForNode(domnode) : false;
      }
      this.bounds[idx] = bounds;

      if (bounds && mouse.objectsCollide(selectionRectangle, bounds, this.clickTolerance, node.key)) {
        // node is in the selection rectangle
        this.selectItem(idx);
      } else {
        // node is not in the selection rectangle
        this.deselectItem(idx);
      }
    }
  }, {
    key: 'changed',
    value: function changed(newSelected, prevSelected) {
      return prevSelected.filter(function (idx) {
        return newSelected.indexOf(idx) === -1;
      });
    }
  }, {
    key: 'xor',
    value: function xor(newSelected, prevSelected) {
      var _this3 = this;

      var ret = [].concat(_toConsumableArray(prevSelected));
      newSelected.forEach(function (idx) {
        return prevSelected.indexOf(idx) === -1 ? _this3.addItem(idx, ret) : ret.splice(ret.indexOf(idx), 1);
      });
      return ret;
    }
  }, {
    key: 'or',
    value: function or(newSelected, prevSelected) {
      var _this4 = this;

      var ret = [].concat(_toConsumableArray(prevSelected));
      newSelected.forEach(function (idx) {
        return prevSelected.indexOf(idx) === -1 ? _this4.addItem(idx, ret) : null;
      });
      return ret;
    }
  }, {
    key: 'selectItemsInRectangle',
    value: function selectItemsInRectangle(selectionRectangle, props) {
      var _this5 = this;

      var findit = arguments.length <= 2 || arguments[2] === undefined ? _reactDom.findDOMNode : arguments[2];
      var mouse = arguments.length <= 3 || arguments[3] === undefined ? _mouseMath2.default : arguments[3];

      if (!this.transaction.previousSelection) {
        // fail-safe
        this.begin([]);
      }
      this.selectedIndices = [];
      this.props = props;
      this.removed = [];
      this.added = [];

      // get a list of all nodes that are potential selects from the selection rectangle
      this.nodes.forEach(this.testNodes.bind(this, { selectionRectangle: selectionRectangle, props: props, findit: findit, mouse: mouse }));

      // add the nodes that are logically selected in-between
      var options = props.selectionOptions;
      if (options.inBetween && this.selectedIndices.length) {
        (function () {
          var min = Math.min.apply(Math, _toConsumableArray(_this5.selectedIndices));
          var max = Math.max.apply(Math, _toConsumableArray(_this5.selectedIndices));
          var filled = Array.apply(min, Array(max - min)).map(function (x, y) {
            return min + y + 1;
          });
          filled.unshift(min);
          if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.selection) {
            _debug2.default.log('gaps to fill', filled);
          }
          filled.forEach(function (idx) {
            return _this5.selectItem(idx);
          });
        })();
      }

      // for additive, we will use xor
      if (options.additive) {
        this.selectedIndices = this.xor(this.selectedIndices, this.transaction.previousSelection);
      } else {
        this.selectedIndices = this.or(this.selectedIndices, this.transaction.previousSelection);
      }

      var test = this.transaction.additionalSelectionMap[this.keyize(this.selectedIndices)];
      if (test) {
        this.selectedIndices = test;
      }
      if (this.selectedIndices.length === this.transaction.mostRecentSelection.length) {
        if (this.selectedIndices.every(function (idx, i) {
          return _this5.transaction.mostRecentSelection[i] === idx;
        })) return false;
      }
      this.removed = this.changed(this.selectedIndices, this.transaction.mostRecentSelection);
      this.added = this.changed(this.transaction.mostRecentSelection, this.selectedIndices);
      this.transaction.previousMostRecentSelection = [].concat(_toConsumableArray(this.transaction.mostRecentSelection));
      this.transaction.mostRecentSelection = [].concat(_toConsumableArray(this.selectedIndices));
      return true;
    }
  }, {
    key: 'notifyChangedNodes',
    value: function notifyChangedNodes() {
      var _this6 = this;

      this.removed.map(function (idx) {
        return _this6.nodes[idx].callback ? _this6.nodes[idx].callback(false) : null;
      });
      this.added.map(function (idx) {
        return _this6.nodes[idx].callback ? _this6.nodes[idx].callback(true) : null;
      });
    }
  }, {
    key: 'clear',
    value: function clear() {
      var _this7 = this;

      this.added = [];
      this.removed = [];
      if (this.selectedIndices.length === 0) return false;
      this.selectedIndices.forEach(function (idx) {
        return _this7.nodes[idx].callback && _this7.nodes[idx].callback(false);
      });
      this.selectedIndices = [];
      return true;
    }
  }, {
    key: 'revert',
    value: function revert() {
      var _this8 = this;

      var add = this.removed;
      var remove = this.added;

      add.forEach(function (idx) {
        return _this8.addItem(idx, _this8.selectedIndices);
      });
      remove.forEach(function (idx) {
        return _this8.removeItem(idx, _this8.selectedIndices);
      });
    }
  }, {
    key: 'keyize',
    value: function keyize(indices) {
      return indices.toString();
    }
  }, {
    key: 'setSelection',
    value: function setSelection(indices) {
      this.transaction.additionalSelectionMap[this.keyize(this.selectedIndices)] = indices;
      this.selectedIndices = [].concat(_toConsumableArray(indices));
      this.removed = this.changed(this.selectedIndices, this.transaction.previousMostRecentSelection);
      this.added = this.changed(this.transaction.previousMostRecentSelection, this.selectedIndices);
      this.mostRecentSelection = [].concat(_toConsumableArray(indices));
    }
  }]);

  return selectList;
}();

exports.default = selectList;
module.exports = exports['default'];