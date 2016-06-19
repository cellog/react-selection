/* eslint guard-for-in:0 */
function mouseEvent(type, sx, sy, cx, cy) {
  let evt = {}
  const e = {
    bubbles: true,
    cancelable: (type !== "mousemove"),
    view: window,
    detail: 0,
    screenX: sx,
    screenY: sy,
    clientX: cx,
    clientY: cy,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  }
  if (typeof( document.createEvent ) === "function") {
    evt = document.createEvent("MouseEvents")
    evt.initMouseEvent(type,
      e.bubbles, e.cancelable, e.view, e.detail,
      e.screenX, e.screenY, e.clientX, e.clientY,
      e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
      e.button, document.body.parentNode)
  } else if (document.createEventObject) {
    evt = document.createEventObject()
    for (const prop in e) {
      evt[prop] = e[prop]
    }
    evt.button = { 0: 1, 1: 4, 2: 2 }[evt.button] || evt.button
  }
  return evt
}
function dispatchEvent(el, evt) {
  if (el.dispatchEvent) {
    el.dispatchEvent(evt)
  } else if (el.fireEvent) {
    el.fireEvent(`on${evt.type}`, evt)
  }
  return evt
}
function createTouch(element, x, y, id, sx = null, sy = null, cx = null, cy = null) {
  return {
    pageX: x,
    pageY: y,
    screenX: sx === null ? x : sx,
    screenY: sy === null ? y : sy,
    clientX: cx === null ? x : cx,
    clientY: cy === null ? y : cy,
    target: element,
    identifier: id
  }
}

function touchEvent(type, touchList) {
  const event = document.createEvent('Event')
  event.initEvent(type, true, true)
  event.touches = event.targetTouches = event.changedTouches = touchList
  return event
}

export { dispatchEvent, mouseEvent, touchEvent, createTouch }
