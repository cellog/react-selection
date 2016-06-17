import 'should'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import InputManager from '../src/InputManager.js'
import Debug from '../src/debug.js'

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
})
