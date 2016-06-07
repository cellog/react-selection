'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getBoundsForNode;
function pageOffset(dir) {
  if (dir === 'left') return window.pageXOffset || window.scrollX || document.body.scrollLeft || 0;
  if (dir === 'top') return window.pageYOffset || window.scrollY || document.body.scrollTop || 0;
}

/**
 * Given a node, get everything needed to calculate its boundaries
 * @param  {HTMLElement} node
 * @return {Object}
 */
function getBoundsForNode(node) {
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