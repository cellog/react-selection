export default class Debug {
  static DEBUGGING = {
    debug: false,
    bounds: false,
    clicks: false,
    selection: false,
    registration: false,
    collisions: false,
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
      console.log(`collide ${key}: `, getBoundsForNode(nodeA), getBoundsForNode(nodeB))
      if (Debug.DEBUGGING.collisions) {
        console.log('a bottom < b top', ((aBottom - tolerance ) < bTop))
        console.log('a top > b bottom', (aTop + tolerance) > (bBottom))
        console.log('a right < b left', ((aBottom - tolerance ) < bTop))
        console.log('a left > b right', (aLeft + tolerance) > (bRight))
      }
      console.log(!(
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
