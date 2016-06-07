import Debug from './debug.js'

export default class mouseMath {
  static contains(element, x, y, doc = document) {
    if (!element) return true
    const point = doc.elementFromPoint(x, y)
    return element.contains(point)
  }

  static objectsCollide(nodeA, nodeB, tolerance = 0, key = '(unknown)') {
    const {
      top: aTop,
      left: aLeft,
      right: aRight = aLeft,
      bottom: aBottom = aTop
    } = mouseMath.getBoundsForNode(nodeA)
    const {
      top: bTop,
      left: bLeft,
      right: bRight = bLeft,
      bottom: bBottom = bTop
    } = mouseMath.getBoundsForNode(nodeB)
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      Debug.debugBounds(mouseMath.getBoundsForNode, nodeA, nodeB, key, tolerance)
    }

    return !(
      // 'a' bottom doesn't touch 'b' top
      ((aBottom + tolerance ) < bTop) ||
      // 'a' top doesn't touch 'b' bottom
      ((aTop - tolerance) > (bBottom)) ||
      // 'a' right doesn't touch 'b' left
      ((aRight + tolerance) < bLeft ) ||
      // 'a' left doesn't touch 'b' right
      ((aLeft - tolerance) > (bRight) )
    )
  }

  static pageOffset(dir, win = window, doc = document) {
    if (dir === 'left') {
      return (win.pageXOffset || win.scrollX || doc.body.scrollLeft || 0)
    }
    if (dir === 'top') {
      return (win.pageYOffset || win.scrollY || doc.body.scrollTop || 0)
    }
    throw new Error(`direction must be one of top or left, was "${dir}"`)
  }

  /**
   * Given a node, get everything needed to calculate its boundaries
   * @param  {HTMLElement} node
   * @return {Object}
   */
  static getBoundsForNode(node, pageOffset = mouseMath.pageOffset) {
    if (!node.getBoundingClientRect) return node

    const rect = node.getBoundingClientRect()
    const left = rect.left + pageOffset('left')
    const top = rect.top + pageOffset('top')

    return {
      top,
      left,
      right: (node.offsetWidth || 0) + left,
      bottom: (node.offsetHeight || 0) + top
    }
  }

  static createSelectRect(e, { x, y }) {
    const w = Math.abs(x - e.pageX)
    const h = Math.abs(y - e.pageY)

    const left = Math.min(e.pageX, x)
    const top = Math.min(e.pageY, y)

    return {
      top,
      left,
      x: e.pageX,
      y: e.pageY,
      right: left + w,
      bottom: top + h
    }
  }

  static isClick(e, { x, y }, tolerance) {
    return (
      Math.abs(e.pageX - x) <= tolerance &&
      Math.abs(e.pageY - y) <= tolerance
    )
  }

}
