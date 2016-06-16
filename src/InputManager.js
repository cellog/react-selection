import { findDOMNode } from 'react-dom'

import mouseMath from './mouseMath.js'
import Debug from './debug.js'

export default class InputManager {
  constructor(ref, notify, component) {
    this.node = findDOMNode(ref)
    this.notify = notify

    this.cancel = this.cancel.bind(this)
    this.end = this.end.bind(this)
    this.move = this.move.bind(this)
    this.mouseDown = this.mouseDown.bind(this)
    this.touchStart = this.touchStart.bind(this)

    this.handlers = {
      stopmouseup: () => null,
      stopmousemove: () => null,
      stoptouchend: () => null,
      stoptouchmove: () => null,
      stoptouchcancel: () => null,
      stopmousedown: () => null,
      stoptouchstart: () => null
    }

    this.addListener(this.node, 'mousedown', this.mouseDown)
    this.addListener(this.node, 'touchstart', this.touchStart)

    this.bounds = mouseMath.getBoundsForNode(this.node)
    this.component = component
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
    const invalid = e.touches && e.touches.length > 1
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

  touchStart(e) {
    if (!this.validSelectStart(e)) {
      this.notify.invalid(e, 'touchstart')
      return
    }
    this.addListener(window, 'touchcancel', this.cancel)
    this.addListener(window, 'touchend', this.end)
    this.addListener(window, 'touchmove', this.move)
    this.start(e, 'touchstart')
  }

  mouseDown(e) {
    if (!this.validSelectStart(e)) {
      this.notify.invalid(e, 'mousedown')
      return
    }
    this.addListener(window, 'mousemove', this.move)
    this.addListener(window, 'mouseup', this.end)
    this.start(e, 'mousedown')
  }

  start(e, eventname) {
    if (!this.node) {
      this.node = findDOMNode(this.ref)
      this.bounds = mouseMath.getBoundsForNode(this.node)
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
        Debug.log(`${eventname}: got bounds`, this.bounds)
      }
    }

    const coords = mouseMath.getCoordinates(e, e.touches && e.touches[0].identifier)
    if (!mouseMath.contains(this.node, coords.clientX, coords.clientY)) {
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

    if (!mouseMath.objectsCollide(this.bounds, {
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

    this._selectRect = mouseMath.createSelectRect(coords, this.mouseDownData)
    this.notify.start(this.bounds, this.mouseDownData, this._selectRect)
    e.preventDefault()
  }

  move(e) {
    const coords = mouseMath.getCoordinates(e, this.mouseDownData.touchID)
    this._selectRect = mouseMath.createSelectRect(coords, this.mouseDownData)
    this.notify.change(this._selectRect)
  }

  end(e) {
    this.handlers.stopmousemove()
    this.handlers.stopmouseup()
    this.handlers.stoptouchcancel()
    this.handlers.stoptouchend()
    this.handlers.stoptouchmove()

    if (mouseMath.isClick(e, this.mouseDownData, this.clickTolerance)) {
      this.notify.click(e, this.mouseDownData, this._selectRect)
      return
    }
    this.notify.end(e, this.mouseDownData, this._selectRect)
  }

  cancel() {
    this.notify.cancel()
  }
}
