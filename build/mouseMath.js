'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('./debug.js');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mouseMath = function () {
  function mouseMath() {
    _classCallCheck(this, mouseMath);
  }

  _createClass(mouseMath, null, [{
    key: 'contains',
    value: function contains(element, x, y) {
      var doc = arguments.length <= 3 || arguments[3] === undefined ? document : arguments[3];

      if (!element) return true;
      var point = doc.elementFromPoint(x, y);
      return element.contains(point);
    }
  }, {
    key: 'objectsCollide',
    value: function objectsCollide(nodeA, nodeB) {
      var tolerance = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var key = arguments.length <= 3 || arguments[3] === undefined ? '(unknown)' : arguments[3];

      var _mouseMath$getBoundsF = mouseMath.getBoundsForNode(nodeA);

      var aTop = _mouseMath$getBoundsF.top;
      var aLeft = _mouseMath$getBoundsF.left;
      var _mouseMath$getBoundsF2 = _mouseMath$getBoundsF.right;
      var aRight = _mouseMath$getBoundsF2 === undefined ? aLeft : _mouseMath$getBoundsF2;
      var _mouseMath$getBoundsF3 = _mouseMath$getBoundsF.bottom;
      var aBottom = _mouseMath$getBoundsF3 === undefined ? aTop : _mouseMath$getBoundsF3;

      var _mouseMath$getBoundsF4 = mouseMath.getBoundsForNode(nodeB);

      var bTop = _mouseMath$getBoundsF4.top;
      var bLeft = _mouseMath$getBoundsF4.left;
      var _mouseMath$getBoundsF5 = _mouseMath$getBoundsF4.right;
      var bRight = _mouseMath$getBoundsF5 === undefined ? bLeft : _mouseMath$getBoundsF5;
      var _mouseMath$getBoundsF6 = _mouseMath$getBoundsF4.bottom;
      var bBottom = _mouseMath$getBoundsF6 === undefined ? bTop : _mouseMath$getBoundsF6;

      if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.bounds) {
        _debug2.default.debugBounds(mouseMath.getBoundsForNode, nodeA, nodeB, key, tolerance);
      }

      return !(
      // 'a' bottom doesn't touch 'b' top
      aBottom + tolerance < bTop ||
      // 'a' top doesn't touch 'b' bottom
      aTop - tolerance > bBottom ||
      // 'a' right doesn't touch 'b' left
      aRight + tolerance < bLeft ||
      // 'a' left doesn't touch 'b' right
      aLeft - tolerance > bRight);
    }
  }, {
    key: 'pageOffset',
    value: function pageOffset(dir) {
      var win = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];
      var doc = arguments.length <= 2 || arguments[2] === undefined ? document : arguments[2];

      if (dir === 'left') {
        return win.pageXOffset || win.scrollX || doc.body.scrollLeft || 0;
      }
      if (dir === 'top') {
        return win.pageYOffset || win.scrollY || doc.body.scrollTop || 0;
      }
      throw new Error('direction must be one of top or left, was "' + dir + '"');
    }

    /**
     * Given a node, get everything needed to calculate its boundaries
     * @param  {HTMLElement} node
     * @return {Object}
     */

  }, {
    key: 'getBoundsForNode',
    value: function getBoundsForNode(node) {
      var pageOffset = arguments.length <= 1 || arguments[1] === undefined ? mouseMath.pageOffset : arguments[1];

      if (!node.getBoundingClientRect) return node;

      var rect = node.getBoundingClientRect();
      var left = rect.left + pageOffset('left');
      var top = rect.top + pageOffset('top');

      return {
        top: top,
        left: left,
        right: (node.offsetWidth || 0) + left,
        bottom: (node.offsetHeight || 0) + top
      };
    }
  }, {
    key: 'createSelectRect',
    value: function createSelectRect(e, _ref) {
      var x = _ref.x;
      var y = _ref.y;

      var w = Math.abs(x - e.pageX);
      var h = Math.abs(y - e.pageY);

      var left = Math.min(e.pageX, x);
      var top = Math.min(e.pageY, y);

      return {
        top: top,
        left: left,
        x: e.pageX,
        y: e.pageY,
        right: left + w,
        bottom: top + h
      };
    }
  }, {
    key: 'isClick',
    value: function isClick(e, _ref2, tolerance) {
      var x = _ref2.x;
      var y = _ref2.y;

      return Math.abs(e.pageX - x) <= tolerance && Math.abs(e.pageY - y) <= tolerance;
    }
  }]);

  return mouseMath;
}();

exports.default = mouseMath;