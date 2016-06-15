import Debug from './debug.js'

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

export default class mouseMath {
  static contains(element, x, y, doc = document) {
    if (!element) return true
    const point = doc.elementFromPoint(x, y)
    return element.contains(point)
  }

  static getCoordinates(e, id, con = console) {
    if (!e.touches && e.clientX) {
      return {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY
      }
    }
    if (e.touches) {
      let idx = 0
      for (; idx < e.touches.length; idx++) {
        if (e.touches[idx].identifier === id) {
          break
        }
      }
      if (idx >= e.touches.length) {
        con.warn('no touch found with identifier')
        idx = 0
      }
      return {
        clientX: e.touches[idx].clientX,
        clientY: e.touches[idx].clientY,
        pageX: e.touches[idx].pageX,
        pageY: e.touches[idx].pageY
      }
    }
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

  static pageOffset(dir, useLocal = false, win = window) {
    if (dir !== 'left' && dir !== 'top') {
      throw new Error(`direction must be one of top or left, was "${dir}"`)
    }
    const offsetname = dir === 'left' ? 'pageXOffset' : 'pageYOffset'
    const backup = dir === 'left' ? win.document.body.scrollLeft : win.document.body.scrollTop
    let offset = win[offsetname] ? win[offsetname] : 0
    if (!offset) offset = 0
    let parentoffset = 0
    if (!useLocal && win.parent && win.parent.window) {
      parentoffset = win.parent.window[offsetname]
    }
    if (!parentoffset) parentoffset = 0
    return Math.max(backup, offset, parentoffset, 0)
  }

  /**
   * Given a node, get everything needed to calculate its boundaries
   * @param  {HTMLElement} node
   * @return {Object}
   */
  static getBoundsForNode(node, win = window, pageOffset = mouseMath.pageOffset) {
    if (!node.getBoundingClientRect) return node

    const rect = node.getBoundingClientRect()
    const left = rect.left + pageOffset('left', iOS, win)
    const top = rect.top + pageOffset('top', iOS, win)

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
