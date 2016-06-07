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
      if (!element) return true;
      var point = document.elementFromPoint(x, y);
      return element.contains(point);
    }
  }, {
    key: 'objectsCollide',
    value: function objectsCollide(nodeA, nodeB) {
      var tolerance = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
      var key = arguments.length <= 3 || arguments[3] === undefined ? '(unknown)' : arguments[3];
      var debugCallback = arguments[4];

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

      if (_debug2.default.DEBUGGING.debug && _debug2.default.DEBUGGING.bounds) _debug2.default.debugBounds(mouseMath.getBoundsForNode, nodeA, nodeB, key);

      return !(
      // 'a' bottom doesn't touch 'b' top
      aBottom - tolerance < bTop ||
      // 'a' top doesn't touch 'b' bottom
      aTop + tolerance > bBottom ||
      // 'a' right doesn't touch 'b' left
      aRight - tolerance < bLeft ||
      // 'a' left doesn't touch 'b' right
      aLeft + tolerance > bRight);
    }
  }, {
    key: 'pageOffset',
    value: function pageOffset(dir) {
      if (dir === 'left') return window.pageXOffset || window.scrollX || document.body.scrollLeft || 0;
      if (dir === 'top') return window.pageYOffset || window.scrollY || document.body.scrollTop || 0;
    }

    /**
     * Given a node, get everything needed to calculate its boundaries
     * @param  {HTMLElement} node
     * @return {Object}
     */

  }, {
    key: 'getBoundsForNode',
    value: function getBoundsForNode(node) {
      if (!node.getBoundingClientRect) return node;

      var rect = node.getBoundingClientRect();
      var left = rect.left + mouseMath.pageOffset('left');
      var top = rect.top + mouseMath.pageOffset('top');

      return {
        top: top,
        left: left,
        right: (node.offsetWidth || 0) + left,
        bottom: (node.offsetHeight || 0) + top
      };
    }
  }]);

  return mouseMath;
}();

exports.default = mouseMath;