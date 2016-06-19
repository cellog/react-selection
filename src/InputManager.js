import { findDOMNode } from 'react-dom'

import mouseMath from './mouseMath.js'
import Debug from './debug.js'
const spies = {
  mouseDown: false,
  touchStart: false
}
export default class InputManager {
  constructor(ref, notify, component, findit = findDOMNode, mouse = mouseMath) {
    this.node = findit(ref)
    if (!this.node) {
      throw new Error(`Selection components must have elements as children, not null (in ${
        Object.getPrototypeOf(component).constructor.displayName})`)
    }
    this.notify = notify

    this.cancel = this.cancel.bind(this)
    this.end = this.end.bind(this)
    this.move = this.move.bind(this)
    this.mouseDown = this.mouseDown.bind(this)
    this.touchStart = this.touchStart.bind(this)

    this.handlers = {
      stopmousedown: () => null,
      stopmouseup: () => null,
      stopmousemove: () => null,
      stoptouchstart: () => null,
      stoptouchend: () => null,
      stoptouchmove: () => null,
      stoptouchcancel: () => null
    }

    this.bounds = mouse.getBoundsForNode(this.node)
    this.component = component

    this.addListener(this.node, 'mousedown', this.mouseDown)
    this.addListener(this.node, 'touchstart', this.touchStart)
  }

  unmount() {
    this.handlers.stopmousedown()
    this.handlers.stopmouseup()
    this.handlers.stopmousemove()
    this.handlers.stoptouchstart()
    this.handlers.stoptouchend()
    this.handlers.stoptouchmove()
    this.handlers.stoptouchcancel()
  }

  validSelectStart(e) {
    const invalid = e && e.touches && e.touches.length > 1
      || e.which === 3
      || e.button === 2
      || !this.component.props.selectable
    return !invalid
  }

  addListener(node, type, handler) {
    node.addEventListener(type, handler)
    this.handlers[`stop${type}`] = () => {
      node.removeEventListener(type, handler)
      this.handlers[`stop${type}`] = () => null
    }
  }

  touchStart(e, win = window) {
    if (spies.touchStart) spies.touchStart(e)
    if (!this.validSelectStart(e)) {
      this.notify.invalid(e, 'touchstart')
      return
    }
    this.addListener(win, 'touchcancel', this.cancel)
    this.addListener(win, 'touchend', this.end)
    this.addListener(win, 'touchmove', this.move)
    this.start(e, 'touchstart')
  }

  mouseDown(e, win = window) {
    if (spies.mouseDown) spies.mouseDown(e)
    if (!this.validSelectStart(e)) {
      this.notify.invalid(e, 'mousedown')
      return
    }
    this.addListener(win, 'mousemove', this.move)
    this.addListener(win, 'mouseup', this.end)
    this.start(e, 'mousedown')
  }

  start(e, eventname, findit = findDOMNode, mouse = mouseMath) {
    // if (!this.node) { // pretty sure this is unneeded.  Keep just in case
    //   this.node = findit(this.ref)
    //   this.bounds = mouse.getBoundsForNode(this.node)
    //   if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
    //     Debug.log(`${eventname}: got bounds`, this.bounds)
    //   }
    // }

    const coords = mouse.getCoordinates(e, e.touches && e.touches[0].identifier)
    if (!mouse.contains(this.node, coords.clientX, coords.clientY)) {
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
        Debug.log(`${eventname}: not contained`)
      }
      return
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
      Debug.log(`${eventname}: click/tap start`)
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      Debug.log(`${eventname}: bounds`, this.bounds, e.pageY, e.pageX)
    }

    if (!mouse.objectsCollide(this.bounds, {
      top: coords.pageY,
      left: coords.pageX
    })) return

    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
      Debug.log(`${eventname}: maybe select`)
    }

    this.mouseDownData = {
      x: coords.pageX,
      y: coords.pageY,
      clientX: coords.clientX,
      clientY: coords.clientY,
      touchID: e.touches ? e.touches[0].identifier : false
    }

    this._selectRect = mouse.createSelectRect(coords, this.mouseDownData)
    this.notify.start(this.bounds, this.mouseDownData, this._selectRect)
    e.preventDefault()
  }

  move(e, mouse = mouseMath) {
    const coords = mouse.getCoordinates(e, this.mouseDownData.touchID)
    this._selectRect = mouse.createSelectRect(coords, this.mouseDownData)
    this.notify.change(this._selectRect)
  }

  end(e, mouse = mouseMath) {
    this.handlers.stopmousemove()
    this.handlers.stopmouseup()
    this.handlers.stoptouchcancel()
    this.handlers.stoptouchend()
    this.handlers.stoptouchmove()

    if (mouse.isClick(e, this.mouseDownData, this.component.props.clickTolerance)) {
      this.notify.click(e, this.mouseDownData, this._selectRect)
      return
    }
    this.notify.end(e, this.mouseDownData, this._selectRect)
  }

  cancel() {
    this.notify.cancel()
  }
}

export { spies }
