import 'should'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

import InputManager from '../src/InputManager.js'
import Debug from '../src/debug.js'
import { dispatchEvent, mouseEvent } from './simulateMouseEvents.js'

describe("InputManager", function() {
  describe("construction", () => {
    const findit = (i) => i
    const notify = {}
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }

    it("should set up bounds and register 2 listeners", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.component.should.equal(me)
      manager.notify.should.equal(notify)

      me.events.should.have.length(2)
      me.events.should.eql([
        ['mousedown', manager.mouseDown],
        ['touchstart', manager.touchStart],
      ])

      me.events = []
      manager.handlers.stopmousedown()
      manager.handlers.stopmousedown()
      manager.handlers.stoptouchstart()
      me.events.should.have.length(2)
      me.events[0][0].should.equal('mousedown')
      me.events[1][0].should.equal('touchstart')
    })
  })

  describe("unmount", () => {
    const findit = (i) => i
    const notify = {}
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }
    it("should call all event unhandlers", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.handlers = {
        stopmouseup: sinon.spy(),
        stopmousemove: sinon.spy(),
        stoptouchend: sinon.spy(),
        stoptouchmove: sinon.spy(),
        stoptouchcancel: sinon.spy(),
        stopmousedown: sinon.spy(),
        stoptouchstart: sinon.spy()
      }

      manager.unmount()

      expect(manager.handlers.stopmouseup.called).to.be.true
      expect(manager.handlers.stopmousemove.called).to.be.true
      expect(manager.handlers.stoptouchend.called).to.be.true
      expect(manager.handlers.stoptouchmove.called).to.be.true
      expect(manager.handlers.stoptouchcancel.called).to.be.true
      expect(manager.handlers.stopmousedown.called).to.be.true
      expect(manager.handlers.stoptouchstart.called).to.be.true
    })
  })

  describe("validSelectStart", () => {
    const findit = (i) => i
    const notify = {}
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }
    it("should fail on multi-touch", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
        touches: [1,2]
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
        props: { selectable: true }
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
        props: { selectable: false }
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
        props: { selectable: true }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      expect(manager.validSelectStart({
      })).to.be.true
    })
  })

  describe("touchStart", () => {
    const findit = (i) => i
    const notify = {
      invalid: sinon.spy()
    }
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }

    it("should notify on fail", () => {
      const notify = {
        invalid: sinon.spy()
      }
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.touchStart({
        touches: [1,2,3]
      })

      expect(notify.invalid.called).to.be.true
    })

    it("should start 3 event listeners", () => {
      const notify = {
        invalid: sinon.spy()
      }
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        removeEventListener(...args) {
          this.events.push(args)
        },
        props: { selectable: true }
      }
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
    const notify = {
      invalid: sinon.spy()
    }
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }

    it("should notify on fail", () => {
      const notify = {
        invalid: sinon.spy()
      }
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)

      manager.mouseDown({
        which: 3
      })

      expect(notify.invalid.called).to.be.true
    })

    it("should start 2 event listeners", () => {
      const notify = {
        invalid: sinon.spy()
      }
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        },
        props: { selectable: true }
      }
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
      getBoundsForNode(node) {
        return 'hi'
      },
      getCoordinates(e, id) {
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
      getBoundsForNode(node) {
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
    const rect = {
      hi: 'hi'
    }
    const mouse = {
      getBoundsForNode(node) {
        return 'hi'
      }
    }

    beforeEach(() => {
      notify.end = sinon.spy()
      notify.click = sinon.spy()
      mouse.isClick = () => false
    })

    it ("should call all handler listener removers", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
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
      getBoundsForNode(node) {
        return 'hi'
      }
    }

    it ("should notify cancel", () => {
      const me = {
        events: [],
        addEventListener(...args) {
          this.events.push(args)
        }
      }
      const manager = new InputManager(me, notify, me, findit, mouse)
      
      manager.cancel()

      expect(notify.cancel.called).is.true
    })
  })

  describe("real browser usage", () => {
    it.only("should attach to an actual DOM node and grab its bounds", () => {
      if (window.____isjsdom) return
      let manager
      const notify = {
        start: sinon.spy()
      }
      const Test = class extends React.Component {
        render() {
          return (
            <div style={{height: 50, width: 50}}
                 ref={(ref) => { if (ref) manager = new InputManager(ref, notify, this)}} >
              hi
            </div>
          )
        }
      }
      const div = document.createElement('div')
      document.body.insertBefore(div, document.body.firstElementChild)

      render(<Test selectable />, div)

      manager.should.be.instanceOf(InputManager)

      manager.node.tagName.toUpperCase().should.equal('DIV')
      manager.bounds.should.eql({
        top: 0,
        left: 0,
        right: 50,
        bottom: 50
      })
      expect(manager.mouseDownData).is.undefined

      const fakemousedown = mouseEvent('mousedown', 25, 25, 25, 25)

      dispatchEvent(div.firstElementChild, fakemousedown)

      manager.mouseDownData.should.eql({
        x: 25,
        y: 25,
        clientX: 25,
        clientY: 25,
        touchID: false
      })

      unmountComponentAtNode(div)
      document.body.removeChild(div)
    })
  })
})
