export default class Debug {
  static DEBUGGING = {
    debug: false,
    bounds: false,
    clicks: false,
    selection: false,
    registration: false,
    collisions: false,
  }

  static log(...props) {
    Function.prototype.bind.call(console.log, console).apply(console, props) /* eslint no-console: 0 */
  }

  static DOMFlush(id) {
    let tmp = 0
    // flush the DOM in IE
    // (http://stackoverflow.com/questions/1397478/forcing-a-dom-refresh-in-internet-explorer-after-javascript-dom-manipulation)
    const elementOnShow = document.getElementById(id)
    if (navigator.appName === 'Microsoft Internet Explorer') {
      tmp = `${elementOnShow.parentNode.offsetTop}px`
    } else {
      tmp = elementOnShow.offsetTop
    }
    return tmp // dummy value, only here to fool eslint
  }

  static debug({ bounds = false, clicks = false, selection = false, registration = false, collisions = false }) {
    if (bounds || clicks || selection || registration || collisions) {
      const props = { bounds, clicks, selection, registration, collisions }
      Debug.DEBUGGING = {
        debug: true,
        ...props
      }
    } else {
      Debug.DEBUGGING.debug = false
    }
  }

  static debugBounds(getBoundsForNode, nodeA, nodeB, key, tolerance) {
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      const {
        top: aTop,
        left: aLeft,
        right: aRight = aLeft,
        bottom: aBottom = aTop
      } = getBoundsForNode(nodeA)
      const {
        top: bTop,
        left: bLeft,
        right: bRight = bLeft,
        bottom: bBottom = bTop
      } = getBoundsForNode(nodeB)
      Debug.log(`collide ${key}: `, getBoundsForNode(nodeA), getBoundsForNode(nodeB))
      if (Debug.DEBUGGING.collisions) {
        Debug.log('a bottom < b top', ((aBottom - tolerance ) < bTop))
        Debug.log('a top > b bottom', (aTop + tolerance) > (bBottom))
        Debug.log('a right < b left', ((aBottom - tolerance ) < bTop))
        Debug.log('a left > b right', (aLeft + tolerance) > (bRight))
      }
      Debug.log(!(
        // 'a' bottom doesn't touch 'b' top
        ((aBottom - tolerance ) < bTop) ||
        // 'a' top doesn't touch 'b' bottom
        ((aTop + tolerance) > (bBottom)) ||
        // 'a' right doesn't touch 'b' left
        ((aRight - tolerance) < bLeft ) ||
        // 'a' left doesn't touch 'b' right
        ((aLeft + tolerance) > (bRight) )
      ) ? `${key} COLLIDES` : `${key} does not collide`)
    }
  }
}
