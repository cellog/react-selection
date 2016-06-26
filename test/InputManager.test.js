import 'should'
import React from 'react'
import $ from 'teaspoon'

import InputManager from '../src/InputManager.js'
import { mouseEvent, dispatchEvent, touchEvent, createTouch } from './simulateMouseEvents.js'

describe("InputManager", function() {
  const mouse = {
    getBoundsForNode() {
      return 'hi'
    }
  }
  describe("construction", () => {
    const findit = (i) => i
    const notify = {}

    it("should set up bounds", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.component.should.equal(me)
      manager.notify.should.equal(notify)
    })
  })

  describe("unmount", () => {
    const findit = (i) => i
    const notify = {}
    it("should call all event unhandlers", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.handlers = {
        stoptouchstart: sinon.spy(),
        stopmousedown: sinon.spy(),
        stopmouseup: sinon.spy(),
        stopmousemove: sinon.spy(),
        stoptouchend: sinon.spy(),
        stoptouchmove: sinon.spy(),
        stoptouchcancel: sinon.spy(),
      }

      manager.unmount()

      expect(manager.handlers.stopmousedown.called).to.be.true
      expect(manager.handlers.stopmouseup.called).to.be.true
      expect(manager.handlers.stopmousemove.called).to.be.true
      expect(manager.handlers.stoptouchstart.called).to.be.true
      expect(manager.handlers.stoptouchend.called).to.be.true
      expect(manager.handlers.stoptouchmove.called).to.be.true
      expect(manager.handlers.stoptouchcancel.called).to.be.true
    })
  })

  describe("validSelectStart", () => {
    const findit = (i) => i
    const notify = {}
    it("should fail on multi-touch", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
        touches: [1, 2]
      })).to.be.false
    })

    it("should fail on right-click", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
        which: 3
      })).to.be.false

      expect(manager.validSelectStart({
        button: 2
      })).to.be.false
    })

    it("should fail on non-selectable", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: false
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
      })).to.be.false
    })

    it("should succeed on selectable", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
      })).to.be.true
    })
  })

  describe("touchStart", () => {
    const findit = (i) => i
    let notify
    let me

    beforeEach(() => {
      notify = {
        invalid: sinon.spy()
      }
      me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
    })

    it("should notify on fail", () => {
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.touchStart({
        touches: [1, 2, 3]
      })

      expect(notify.invalid.called).to.be.true
    })

    it("should start 3 event listeners", () => {
      const manager = new InputManager(me, notify, me, findit, mouse)

      me.events = []
      manager.start = () => null

      manager.touchStart({
        touches: [1]
      }, me)

      expect(notify.invalid.called).to.be.false

      me.events.should.have.length(3)
      me.events[0][0].should.equal('touchcancel')
      me.events[1][0].should.equal('touchend')
      me.events[2][0].should.equal('touchmove')
    })
  })

  describe("mousedown", () => {
    const findit = (i) => i
    let notify
    let me
    beforeEach(() => {
      notify = {
        invalid: sinon.spy()
      }
      me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
    })

    it("should notify on fail", () => {
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.mouseDown({
        which: 3
      })

      expect(notify.invalid.called).to.be.true
    })

    it("should start 2 event listeners", () => {
      const manager = new InputManager(me, notify, me, findit, mouse)

      me.events = []
      manager.start = () => null

      manager.mouseDown({
      }, me)

      expect(notify.invalid.called).to.be.false

      me.events.should.have.length(2)
      me.events[0][0].should.equal('mousemove')
      me.events[1][0].should.equal('mouseup')
    })
  })

  describe("start", () => {
    const findit = (i) => i
    const notify = {
      start: sinon.spy()
    }
    const rect = {
      hi: 'hi'
    }
    const coords = {
      clientX: 20,
      clientY: 25,
      pageX: 30,
      pageY: 35
    }
    const mouse = {
      getBoundsForNode() {
        return 'hi'
      },
      getCoordinates() {
        return coords
      },
      createSelectRect() {
        return rect
      }
    }

    it("should return silently if the mousedown is not within our bounds", () => {
      mouse.contains = () => false
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.start({}, 'boohoo', findit, mouse)

      expect(manager.mouseDownData).is.undefined
      expect(manager._selectRect).is.undefined
      expect(notify.start.called).is.false
    })

    it("should return silently if the mousedown is outside our tolerance", () => {
      mouse.contains = () => true
      mouse.objectsCollide = () => false
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.start({}, 'boohoo', findit, mouse)

      expect(manager.mouseDownData).is.undefined
      expect(manager._selectRect).is.undefined
      expect(notify.start.called).is.false
    })

    it("should setup data structures and call start notify", () => {
      mouse.contains = () => true
      mouse.objectsCollide = () => true
      notify.start = sinon.spy()
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)
      const e = { preventDefault: sinon.spy() }

      manager.start(e, 'boohoo', findit, mouse)

      expect(manager.mouseDownData).is.eql({
        x: coords.pageX,
        y: coords.pageY,
        clientX: coords.clientX,
        clientY: coords.clientY,
        touchID: false
      })
      expect(manager._selectRect).is.equal(rect)
      expect(notify.start.called).is.true
      expect(e.preventDefault.called).to.be.true
    })

    it("should capture the touch ID if available", () => {
      mouse.contains = () => true
      mouse.objectsCollide = () => true
      notify.start = sinon.spy()
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)
      const e = { preventDefault: sinon.spy(), touches: [{ identifier: 'foo' }] }

      manager.start(e, 'boohoo', findit, mouse)

      expect(manager.mouseDownData).is.eql({
        x: coords.pageX,
        y: coords.pageY,
        clientX: coords.clientX,
        clientY: coords.clientY,
        touchID: 'foo'
      })
      expect(manager._selectRect).is.equal(rect)
      expect(notify.start.called).is.true
      expect(e.preventDefault.called).to.be.true
    })
  })

  describe("move", () => {
    const findit = (i) => i
    const notify = {
      change: sinon.spy()
    }
    const rect = {
      hi: 'hi'
    }
    const mouse = {
      getBoundsForNode() {
        return 'hi'
      },
      getCoordinates: sinon.spy(),
      createSelectRect() {
        return rect
      }
    }

    it("should notify a change in selection rectangle", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.mouseDownData = {
        touchId: false
      }

      manager.move({}, mouse)

      expect(mouse.getCoordinates.called).is.true
      expect(notify.change.called).is.true
      manager._selectRect.should.equal(rect)
    })
  })

  describe("end", () => {
    const findit = (i) => i
    const notify = {
      end: () => null,
      click: () => null
    }
    const mouse = {
      getBoundsForNode() {
        return 'hi'
      }
    }

    beforeEach(() => {
      notify.end = sinon.spy()
      notify.click = sinon.spy()
      mouse.isClick = () => false
    })

    it("should call all handler listener removers", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.handlers.stopmousemove = sinon.spy()
      manager.handlers.stopmouseup = sinon.spy()
      manager.handlers.stoptouchcancel = sinon.spy()
      manager.handlers.stoptouchend = sinon.spy()
      manager.handlers.stoptouchmove = sinon.spy()

      manager.end({}, mouse)

      expect(manager.handlers.stopmousemove.called).is.true
      expect(manager.handlers.stopmouseup.called).is.true
      expect(manager.handlers.stoptouchcancel.called).is.true
      expect(manager.handlers.stoptouchend.called).is.true
      expect(manager.handlers.stoptouchmove.called).is.true
    })

    it("should notify end of select for non-click", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.end({}, mouse)

      expect(notify.end.called).is.true
      expect(notify.click.called).is.false
    })

    it("should notify end of select for non-click", () => {
      mouse.isClick = () => true
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.end({}, mouse)

      expect(notify.end.called).is.false
      expect(notify.click.called).is.true
    })
  })

  describe("cancel", () => {
    const findit = (i) => i
    const notify = {
      cancel: sinon.spy(),
    }
    const mouse = {
      getBoundsForNode() {
        return 'hi'
      }
    }

    it("should notify cancel", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: {
          clickTolerance: 2,
          selectionOptions: {
            selectable: true
          }
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.cancel()

      expect(notify.cancel.called).is.true
    })
  })

  describe("real browser usage", () => {
    let manager
    let notify
    const Test = class extends React.Component {
      render() {
        return (
          <div style={{height: 50, width: 50, position: 'absolute', top: 0, left: 0}}
               ref={(ref) => {
                 if (ref) {
                   manager = new InputManager(ref,
                    notify, {props: { clickTolerance: 2, selectionOptions: { selectable: true } } })
                 }
                 this.ref = ref
               }}
          >
            hi2
          </div>
        )
      }
    }
    let thing
    beforeEach(() => {
      notify = {
        start: sinon.spy(),
        change: sinon.spy(),
        end: sinon.spy(),
        click: sinon.spy()
      }
      thing = $(<Test selectable />).render(true)
    })

    afterEach(() => {
      thing.unmount()
    })

    it("should attach to an actual DOM node and grab its bounds", () => {
      if (window.____isjsdom) return

      manager.should.be.instanceOf(InputManager)

      manager.node.tagName.toUpperCase().should.equal('DIV')
      manager.bounds.should.eql({
        top: 0,
        left: 0,
        right: 50,
        bottom: 50
      })
    })

    it("should trigger mouseDown when prompted", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const ev = mouseEvent('mousedown', 25, 25, 25, 25)
      dispatchEvent(thing.dom(), ev)

      manager.mouseDownData.should.eql({
        x: 25,
        y: 25,
        clientX: 25,
        clientY: 25,
        touchID: false
      })
    })

    it("should trigger touchStart when prompted", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const element = thing.dom()
      const touches = [createTouch(element, 26, 25, 1, 25, 25, 25, 25)]
      const ev = touchEvent('touchstart', touches)
      dispatchEvent(element, ev)

      manager.mouseDownData.should.eql({
        x: 26,
        y: 25,
        clientX: 25,
        clientY: 25,
        touchID: 1
      })
    })

    it("should update selection rectangle when mouse is moved", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const ev = mouseEvent('mousedown', 25, 25, 25, 25)
      dispatchEvent(thing.dom(), ev)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 25,
        y: 25,
        right: 25,
        bottom: 25
      })

      const mousemove = mouseEvent('mousemove', 27, 27, 27, 27)

      dispatchEvent(thing.dom(), mousemove)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 27,
        y: 27,
        right: 27,
        bottom: 27
      })

      const mousemove2 = mouseEvent('mousemove', 23, 23, 23, 23)

      dispatchEvent(thing.dom(), mousemove2)

      manager._selectRect.should.eql({
        top: 23,
        left: 23,
        x: 23,
        y: 23,
        right: 25,
        bottom: 25
      })
    })

    it("should update selection rectangle when finger is dragged", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const element = thing.dom()
      const touches = [createTouch(element, 25, 25, 1, 25, 25, 25, 25)]
      const ev = touchEvent('touchstart', touches)
      dispatchEvent(element, ev)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 25,
        y: 25,
        right: 25,
        bottom: 25
      }, 'setup selection rectangle')

      const touches2 = [createTouch(element, 27, 27, 1)]
      const touchmove = touchEvent('touchmove', touches2)
      dispatchEvent(element, touchmove)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 27,
        y: 27,
        right: 27,
        bottom: 27
      })

      const touches3 = [createTouch(element, 23, 23, 1)]
      const touchmove2 = touchEvent('touchmove', touches3)
      dispatchEvent(element, touchmove2)

      manager._selectRect.should.eql({
        top: 23,
        left: 23,
        x: 23,
        y: 23,
        right: 25,
        bottom: 25
      })
    })

    it("should release handlers, touch-based", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const element = thing.dom()
      const touches = [createTouch(element, 25, 25, 1, 25, 25, 25, 25)]
      const ev = touchEvent('touchstart', touches)
      dispatchEvent(element, ev)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 25,
        y: 25,
        right: 25,
        bottom: 25
      }, 'setup selection rectangle')

      const touches2 = [createTouch(element, 27, 27, 1)]
      const touchmove = touchEvent('touchmove', touches2)
      dispatchEvent(element, touchmove)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 27,
        y: 27,
        right: 27,
        bottom: 27
      })

      const smm = sinon.spy()
      const oldsmm = manager.handlers.stopmousemove
      manager.handlers.stopmousemove = () => {
        smm()
        oldsmm()
      }
      const smu = sinon.spy()
      const oldsmu = manager.handlers.stopmouseup
      manager.handlers.stopmouseup = () => {
        smu()
        oldsmu()
      }
      const stm = sinon.spy()
      const oldstm = manager.handlers.stoptouchmove
      manager.handlers.stoptouchmove = () => {
        stm()
        oldstm()
      }
      const stc = sinon.spy()
      const oldstc = manager.handlers.stoptouchcancel
      manager.handlers.stoptouchcancel = () => {
        stc()
        oldstc()
      }
      const ste = sinon.spy()
      const oldste = manager.handlers.stoptouchend
      manager.handlers.stoptouchend = () => {
        ste()
        oldste()
      }

      const touches3 = [createTouch(element, 27, 27, 1)]
      const touchend = touchEvent('touchend', touches3)
      dispatchEvent(element, touchend)

      expect(smm.called).to.be.true
      expect(smu.called).to.be.true
      expect(stm.called).to.be.true
      expect(stc.called).to.be.true
      expect(ste.called).to.be.true
    })

    it("should release handlers", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const ev = mouseEvent('mousedown', 25, 25, 25, 25)
      dispatchEvent(thing.dom(), ev)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 25,
        y: 25,
        right: 25,
        bottom: 25
      })

      const mousemove = mouseEvent('mousemove', 26, 26, 26, 26)

      dispatchEvent(thing[0].ref, mousemove)

      manager._selectRect.should.eql({
        top: 25,
        left: 25,
        x: 26,
        y: 26,
        right: 26,
        bottom: 26
      })

      const smm = sinon.spy()
      const oldsmm = manager.handlers.stopmousemove
      manager.handlers.stopmousemove = () => {
        smm()
        oldsmm()
      }
      const smu = sinon.spy()
      const oldsmu = manager.handlers.stopmouseup
      manager.handlers.stopmouseup = () => {
        smu()
        oldsmu()
      }
      const stm = sinon.spy()
      const oldstm = manager.handlers.stoptouchmove
      manager.handlers.stoptouchmove = () => {
        stm()
        oldstm()
      }
      const stc = sinon.spy()
      const oldstc = manager.handlers.stoptouchcancel
      manager.handlers.stoptouchcancel = () => {
        stc()
        oldstc()
      }
      const ste = sinon.spy()
      const oldste = manager.handlers.stoptouchend
      manager.handlers.stoptouchend = () => {
        ste()
        oldste()
      }

      const mousemove2 = mouseEvent('mouseup', 26, 26, 26, 26)

      dispatchEvent(thing[0].ref, mousemove2)
      expect(smm.called).to.be.true
      expect(smu.called).to.be.true
      expect(stm.called).to.be.true
      expect(stc.called).to.be.true
      expect(ste.called).to.be.true
    })

    it("should call end for a finger drag", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const element = thing.dom()
      const touches = [createTouch(element, 25, 25, 1, 25, 25, 25, 25)]
      const ev = touchEvent('touchstart', touches)
      dispatchEvent(element, ev)

      const touches2 = [createTouch(element, 27, 27, 1)]
      const touchmove = touchEvent('touchmove', touches2)
      dispatchEvent(element, touchmove)

      const touches3 = [createTouch(element, 27, 27, 1)]
      const touchend = touchEvent('touchend', touches3)
      dispatchEvent(element, touchend)

      expect(notify.end.called, 'end called').to.be.true
      expect(notify.click.called, 'click called').to.be.false
    })

    it("should call end for a mouse drag", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const ev = mouseEvent('mousedown', 25, 25, 25, 25)
      dispatchEvent(thing.dom(), ev)

      const mousemove = mouseEvent('mousemove', 29, 29, 29, 29)

      dispatchEvent(thing[0].ref, mousemove)

      const mouseup = mouseEvent('mouseup', 29, 29, 29, 29)

      dispatchEvent(thing[0].ref, mouseup)

      expect(notify.end.called, 'end called').to.be.true
      expect(notify.click.called, 'click called').to.be.false
    })

    it("should call click for a mouse click", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const ev = mouseEvent('mousedown', 25, 25, 25, 25)
      dispatchEvent(thing.dom(), ev)

      const mousemove = mouseEvent('mousemove', 26, 26, 26, 26)

      dispatchEvent(thing[0].ref, mousemove)

      const mouseup = mouseEvent('mouseup', 26, 26, 26, 26)

      dispatchEvent(thing[0].ref, mouseup)

      expect(notify.end.called, 'end called').to.be.false
      expect(notify.click.called, 'click called').to.be.true
    })

    it("should call end for a tap", () => {
      if (window.____isjsdom) return
      expect(manager.mouseDownData).is.undefined

      const element = thing.dom()
      const touches = [createTouch(element, 25, 25, 1)]
      const ev = touchEvent('touchstart', touches)
      dispatchEvent(element, ev)

      const touches2 = [createTouch(element, 26, 26, 1)]
      const touchmove = touchEvent('touchmove', touches2)
      dispatchEvent(element, touchmove)

      const touches3 = [createTouch(element, 26, 26, 1)]
      const touchend = touchEvent('touchend', touches3)
      dispatchEvent(element, touchend)

      expect(notify.end.called, 'end called').to.be.true
      expect(notify.click.called, 'click called').to.be.false
    })
  })

  describe("addListener", () => {
    const node = {
      addEventListener: sinon.spy(),
      removeEventListener: sinon.spy()
    }
    const findit = () => {
      return {
        addEventListener: () => null
      }
    }
    const mouse = {
      getBoundsForNode() {
        return null
      }
    }
    const manager = new InputManager(1, {}, {}, findit, mouse)
    it("should setup stop handler and stop handler should remove event listener", () => {
      manager.addListener(node, 'foo', 12)

      expect(node.addEventListener.called).to.be.true
      expect(node.removeEventListener.called).to.be.false
      expect(manager.handlers.stopfoo).to.exist.and.be.instanceOf(Function)

      node.addEventListener.args[0][0].should.eql('foo')
      node.addEventListener.args[0][1].should.eql(12)

      manager.handlers.stopfoo()
      expect(node.removeEventListener.called).to.be.true
      node.removeEventListener.args[0][0].should.eql('foo')
      node.removeEventListener.args[0][1].should.eql(12)
      expect(manager.handlers.stopfoo()).to.be.null
    })
  })
})
