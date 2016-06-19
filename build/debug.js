'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Debug = function () {
  function Debug() {
    _classCallCheck(this, Debug);
  }

  _createClass(Debug, null, [{
    key: 'log',
    value: function log() {
      for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
        props[_key] = arguments[_key];
      }

      Function.prototype.bind.call(console.log, console).apply(console, props); /* eslint no-console: 0 */
    }
  }, {
    key: 'DOMFlush',
    value: function DOMFlush(id) {
      var tmp = 0;
      // flush the DOM in IE
      // (http://stackoverflow.com/questions/1397478/forcing-a-dom-refresh-in-internet-explorer-after-javascript-dom-manipulation)
      var elementOnShow = document.getElementById(id);
      if (navigator.appName === 'Microsoft Internet Explorer') {
        tmp = elementOnShow.parentNode.offsetTop + 'px';
      } else {
        tmp = elementOnShow.offsetTop;
      }
      return tmp; // dummy value, only here to fool eslint
    }
  }, {
    key: 'debug',
    value: function debug(_ref) {
      var _ref$bounds = _ref.bounds;
      var bounds = _ref$bounds === undefined ? false : _ref$bounds;
      var _ref$clicks = _ref.clicks;
      var clicks = _ref$clicks === undefined ? false : _ref$clicks;
      var _ref$selection = _ref.selection;
      var selection = _ref$selection === undefined ? false : _ref$selection;
      var _ref$registration = _ref.registration;
      var registration = _ref$registration === undefined ? false : _ref$registration;
      var _ref$collisions = _ref.collisions;
      var collisions = _ref$collisions === undefined ? false : _ref$collisions;

      if (bounds || clicks || selection || registration || collisions) {
        var _props = { bounds: bounds, clicks: clicks, selection: selection, registration: registration, collisions: collisions };
        Debug.DEBUGGING = _extends({
          debug: true
        }, _props);
      } else {
        Debug.DEBUGGING.debug = false;
      }
    }
  }, {
    key: 'debugBounds',
    value: function debugBounds(getBoundsForNode, nodeA, nodeB, key, tolerance) {
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
        var _getBoundsForNode = getBoundsForNode(nodeA);

        var aTop = _getBoundsForNode.top;
        var aLeft = _getBoundsForNode.left;
        var _getBoundsForNode$rig = _getBoundsForNode.right;
        var aRight = _getBoundsForNode$rig === undefined ? aLeft : _getBoundsForNode$rig;
        var _getBoundsForNode$bot = _getBoundsForNode.bottom;
        var aBottom = _getBoundsForNode$bot === undefined ? aTop : _getBoundsForNode$bot;

        var _getBoundsForNode2 = getBoundsForNode(nodeB);

        var bTop = _getBoundsForNode2.top;
        var bLeft = _getBoundsForNode2.left;
        var _getBoundsForNode2$ri = _getBoundsForNode2.right;
        var bRight = _getBoundsForNode2$ri === undefined ? bLeft : _getBoundsForNode2$ri;
        var _getBoundsForNode2$bo = _getBoundsForNode2.bottom;
        var bBottom = _getBoundsForNode2$bo === undefined ? bTop : _getBoundsForNode2$bo;

        Debug.log('collide ' + key + ': ', getBoundsForNode(nodeA), getBoundsForNode(nodeB));
        if (Debug.DEBUGGING.collisions) {
          Debug.log('a bottom < b top', aBottom - tolerance < bTop);
          Debug.log('a top > b bottom', aTop + tolerance > bBottom);
          Debug.log('a right < b left', aBottom - tolerance < bTop);
          Debug.log('a left > b right', aLeft + tolerance > bRight);
        }
        Debug.log(!(
        // 'a' bottom doesn't touch 'b' top
        aBottom - tolerance < bTop ||
        // 'a' top doesn't touch 'b' bottom
        aTop + tolerance > bBottom ||
        // 'a' right doesn't touch 'b' left
        aRight - tolerance < bLeft ||
        // 'a' left doesn't touch 'b' right
        aLeft + tolerance > bRight) ? key + ' COLLIDES' : key + ' does not collide');
      }
    }
  }]);

  return Debug;
}();

Debug.DEBUGGING = {
  debug: false,
  bounds: false,
  clicks: false,
  selection: false,
  registration: false,
  collisions: false
};
exports.default = Debug;
module.exports = exports['default'];