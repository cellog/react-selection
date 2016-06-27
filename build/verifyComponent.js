'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = verifyComponent;
function verifyComponent(Component) {
  var test = void 0;
  if (!(Component instanceof Function)) {
    throw new Error('Component is not a class, must be a stateful React Component class');
  }
  try {
    test = new Component();
    if (test.render instanceof Function) return false;
    return true;
  } catch (e) {
    return true;
  }
}
module.exports = exports['default'];