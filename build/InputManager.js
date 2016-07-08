'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spies = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _reactDom = require('react-dom');

var _mouseMath = require('./mouseMath.js');

var _mouseMath2 = _interopRequireDefault(_mouseMath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var spies = {
  mouseDown: false,
  touchStart: false
};

var InputManager = function () {
  function InputManager(ref, notify, component) {
    var findit = arguments.length <= 3 || arguments[3] === undefined ? _reactDom.findDOMNode : arguments[3];
    var mouse = arguments.length <= 4 || arguments[4] === undefined ? _mouseMath2.default : arguments[4];

    _classCallCheck(this, InputManager);

    this.node = findit(ref);
    if (!this.node) {
      throw new Error('Selection components must have elements as children, not null (in ' + Object.getPrototypeOf(component).constructor.displayName + ')');
    }
    this.notify = notify;

    this.cancel = this.cancel.bind(this);
    this.end = this.end.bind(this);
    this.move = this.move.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.touchStart = this.touchStart.bind(this);

    this.handlers = {
      stopmousedown: function stopmousedown() {
        return null;
      },
      stopmouseup: function stopmouseup() {
        return null;
      },
      stopmousemove: function stopmousemove() {
        return null;
      },
      stoptouchstart: function stoptouchstart() {
        return null;
      },
      stoptouchend: function stoptouchend() {
        return null;
      },
      stoptouchmove: function stoptouchmove() {
        return null;
      },
      stoptouchcancel: function stoptouchcancel() {
        return null;
      }
    };

    this.bounds = mouse.getBoundsForNode(this.node);
    this.component = component;

    this.addListener(this.node, 'mousedown', this.mouseDown);
    this.addListener(this.node, 'touchstart', this.touchStart);
  }

  _createClass(InputManager, [{
    key: 'unmount',
    value: function unmount() {
      this.handlers.stopmousedown();
      this.handlers.stopmouseup();
      this.handlers.stopmousemove();
      this.handlers.stoptouchstart();
      this.handlers.stoptouchend();
      this.handlers.stoptouchmove();
      this.handlers.stoptouchcancel();
    }
  }, {
    key: 'validSelectStart',
    value: function validSelectStart(e) {
      var invalid = e && e.touches && e.touches.length > 1 || e.which === 3 || e.button === 2 || !this.component.props.selectionOptions.selectable;
      return !invalid;
    }
  }, {
    key: 'addListener',
    value: function addListener(node, type, handler) {
      var _this = this;

      node.addEventListener(type, handler);
      this.handlers['stop' + type] = function () {
        node.removeEventListener(type, handler);
        _this.handlers['stop' + type] = function () {
          return null;
        };
      };
    }
  }, {
    key: 'touchStart',
    value: function touchStart(e) {
      var win = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];

      if (spies.touchStart) spies.touchStart(e);
      if (!this.validSelectStart(e)) {
        this.notify.invalid(e, 'touchstart');
        return;
      }
      this.addListener(win, 'touchcancel', this.cancel);
      this.addListener(win, 'touchend', this.end);
      this.addListener(win, 'touchmove', this.move);
      this.start(e, 'touchstart');
    }
  }, {
    key: 'mouseDown',
    value: function mouseDown(e) {
      var win = arguments.length <= 1 || arguments[1] === undefined ? window : arguments[1];

      if (spies.mouseDown) spies.mouseDown(e);
      if (!this.validSelectStart(e)) {
        this.notify.invalid(e, 'mousedown');
        return;
      }
      this.addListener(win, 'mousemove', this.move);
      this.addListener(win, 'mouseup', this.end);
      this.start(e, 'mousedown');
    }
  }, {
    key: 'start',
    value: function start(e, eventname) {
      var findit = arguments.length <= 2 || arguments[2] === undefined ? _reactDom.findDOMNode : arguments[2];
      var mouse = arguments.length <= 3 || arguments[3] === undefined ? _mouseMath2.default : arguments[3];

      var coords = mouse.getCoordinates(e, e.touches && e.touches[0].identifier);
      if (!mouse.contains(this.node, coords.clientX, coords.clientY)) {
        return;
      }

      if (!mouse.objectsCollide(this.bounds, {
        top: coords.pageY,
        left: coords.pageX
      })) return;

      this.mouseDownData = {
        x: coords.pageX,
        y: coords.pageY,
        clientX: coords.clientX,
        clientY: coords.clientY,
        touchID: e.touches ? e.touches[0].identifier : false
      };

      this.selectionRectangle = mouse.createSelectRect(coords, this.mouseDownData);
      this.notify.start(this.bounds, this.mouseDownData, this.selectionRectangle);
      e.preventDefault();
    }
  }, {
    key: 'move',
    value: function move(e) {
      var mouse = arguments.length <= 1 || arguments[1] === undefined ? _mouseMath2.default : arguments[1];

      var coords = mouse.getCoordinates(e, this.mouseDownData.touchID);
      this.selectionRectangle = mouse.createSelectRect(coords, this.mouseDownData);
      this.notify.change(this.selectionRectangle);
    }
  }, {
    key: 'end',
    value: function end(e) {
      var mouse = arguments.length <= 1 || arguments[1] === undefined ? _mouseMath2.default : arguments[1];

      this.handlers.stopmousemove();
      this.handlers.stopmouseup();
      this.handlers.stoptouchcancel();
      this.handlers.stoptouchend();
      this.handlers.stoptouchmove();

      if (mouse.isClick(e, this.mouseDownData, this.component.props.clickTolerance)) {
        this.notify.click(e, this.mouseDownData, this.selectionRectangle);
        return;
      }
      this.notify.end(e, this.mouseDownData, this.selectionRectangle);
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.notify.cancel();
    }
  }]);

  return InputManager;
}();

exports.default = InputManager;
exports.spies = spies;