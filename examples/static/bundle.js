/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _reactSelectionHoc = __webpack_require__(1);

	document.ReactSelection = _reactSelectionHoc.Selection;
	document.ReactSelectable = _reactSelectionHoc.Selectable;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.Debug = exports.Selectable = exports.Selection = undefined;

	var _Selection = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Selection.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Selection2 = _interopRequireDefault(_Selection);

	var _Selectable = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./Selectable.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

	var _Selectable2 = _interopRequireDefault(_Selectable);

	var _debug = __webpack_require__(2);

	var _debug2 = _interopRequireDefault(_debug);

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}

	exports.Selection = _Selection2.default;
	exports.Selectable = _Selectable2.default;
	exports.Debug = _debug2.default;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }return target;
	};

	var _createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	  };
	}();

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	var Debug = function () {
	  function Debug() {
	    _classCallCheck(this, Debug);
	  }

	  _createClass(Debug, null, [{
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
	        var props = { bounds: bounds, clicks: clicks, selection: selection, registration: registration, collisions: collisions };
	        Debug.DEBUGGING = _extends({
	          debug: true
	        }, props);
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

	        console.log('collide ' + key + ': ', getBoundsForNode(nodeA), getBoundsForNode(nodeB));
	        if (Debug.DEBUGGING.collisions) {
	          console.log('a bottom < b top', aBottom - tolerance < bTop);
	          console.log('a top > b bottom', aTop + tolerance > bBottom);
	          console.log('a right < b left', aBottom - tolerance < bTop);
	          console.log('a left > b right', aLeft + tolerance > bRight);
	        }
	        console.log(!(
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

/***/ }
/******/ ]);