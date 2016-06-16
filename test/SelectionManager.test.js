import 'should'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import SelectionManager from '../src/SelectionManager.js'
import Debug from '../src/debug.js'

describe("SelectionManager", function() {
  describe("construction", () => {
    it("should set notify and clickTolerance", () => {
      const notify = {

      }
      const props = {
        clickTolerance: 5
      }
      const manager = new SelectionManager(notify, props)
      manager.notify.should.equal(notify)
      manager.clickTolerance.should.eql(5)
    })
  })

  describe("registerSelectable", () => {
    let manager
    const notify = {

    }
    const props = {
      clickTolerance: 5
    }
    beforeEach(() => {
      manager = new SelectionManager(notify, props)
    })

    it("should add the component to our lists, no bounds cached", () => {
      const thing = {}
      const callback = () => null
      manager.registerSelectable(thing, 'hi', 4, callback, false)
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        callback,
        bounds: null
      }], 'sortedNodes')
      manager.selectables.should.have.property('hi')
      manager.selectables.hi.should.eql({
        component: thing,
        value: 4,
        callback,
        bounds: null
      }, 'selectables')
    })

    it("should not add a duplicate", () => {
      const thing = {}
      const callback = () => null
      manager.registerSelectable(thing, 'hi', 4, callback, false)
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        callback,
        bounds: null
      }])

      manager.registerSelectable(thing, 'hi', 4, callback, false)
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        callback,
        bounds: null
      }])
    })

    it("should add the component to our lists, with bounds cached", () => {
      const thing = {}
      const callback = () => null
      const math = {
        getBoundsForNode() { return 'foobar' }
      }
      const findit = () => null
      
      manager.registerSelectable(thing, 'hi', 4, callback, true, math, findit)
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        callback,
        bounds: 'foobar'
      }])
    })


    it("should add the components in the order they are called", () => {
      const thing1 = {}
      const thing2 = {}
      const thing3 = {}
      const callback = () => null
      manager.registerSelectable(thing1, 'hi', 4, callback, false)
      manager.registerSelectable(thing2, 'hi2', 4, callback, false)
      manager.registerSelectable(thing3, 'hi3', 4, callback, false)

      manager.selectableKeys.should.eql(['hi', 'hi2', 'hi3'])
      manager.sortedNodes.should.eql([
        {
          component: thing1,
          value: 4,
          key: 'hi',
          callback,
          bounds: null
        },
        {
          component: thing2,
          value: 4,
          key: 'hi2',
          callback,
          bounds: null
        },
        {
          component: thing3,
          value: 4,
          key: 'hi3',
          callback,
          bounds: null
        }
      ])
    })
  })
  
  describe("unregisterSelectable", () => {
    let manager
    const notify = {
      updateState: sinon.spy()
    }
    const props = {
      clickTolerance: 5
    }
    const thing = {}
    const callback = () => null
    beforeEach(() => {
      manager = new SelectionManager(notify, props)
      manager.registerSelectable(thing, 'hi', 4, callback, false)
    })

    it("should remove an existing item", () => {
      manager.selectableKeys.should.have.length(1)
      manager.sortedNodes.should.have.length(1)
      manager.unregisterSelectable(thing, 'hi')
      manager.selectableKeys.should.have.length(0)
      manager.sortedNodes.should.have.length(0)
    })

    it("should notify if removing affects the current selection", () => {
      manager.selectableKeys.should.have.length(1)
      manager.sortedNodes.should.have.length(1)
      manager.selectedNodes.hi = thing
      manager.selectedValues.hi = 4
      manager.unregisterSelectable(thing, 'hi')
      manager.selectableKeys.should.have.length(0)
      manager.sortedNodes.should.have.length(0)

      expect(notify.updateState.called).to.equal(true)
    })
  })

  describe("saveNode", () => {
    let manager
    const notify = {

    }
    const props = {
      clickTolerance: 5
    }
    beforeEach(() => {
      manager = new SelectionManager(notify, props)
    })

    it("should add it to the selection trackers", () => {
      const changedNodes = []
      const thing = {key: 'hi', component: {}, value: 5}
      const bounds = {}
      manager.saveNode(changedNodes, thing, bounds)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([
        true, thing
      ])
      manager.selectedNodes.hi.should.eql({
        node: thing.component,
        bounds
      })
      manager.selectedValues.hi.should.eql(5)
    })

    it("should skip an existing item", () => {
      const changedNodes = []
      const thing = {key: 'hi', component: {}, value: 5}
      const bounds = {}
      manager.saveNode(changedNodes, thing, bounds)
      manager.saveNode(changedNodes, thing, bounds)

      changedNodes.should.have.length(1)
    })
  })

  describe("walkNodes", () => {
    let manager
    const notify = {

    }
    const props = {
      clickTolerance: 5
    }
    const mouse = {
      getBoundsForNode(node) {
        return node
      },
      objectsCollide(rect, bounds, tol, key) {
        console.log(bounds, rect)
        return rect.indexOf(bounds) !== -1
      }
    }
    const findit = (i) => i
    beforeEach(() => {
      manager = new SelectionManager(notify, props)
    })

    it("should find nodes within the rect", () => {
      const indices = []
      const changedNodes = []
      const node = {
        component: 2,
        key: 2,
        bounds: false
      }
      manager.walkNodes([1,2,4], indices, changedNodes, node, 1, findit, mouse)

      indices.should.have.length(1)
      indices[0].should.equal(1)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([true, node])
    })

    it("should remove nodes not within the rect", () => {
      const indices = []
      const changedNodes = []
      const node = {
        component: 1,
        key: 2,
        bounds: {}
      }
      manager.selectedNodes[2] = {}
      manager.selectedValues[2] = {}
      manager.walkNodes([1,2,4], indices, changedNodes, node, 3, findit, mouse)
      manager.walkNodes([1,2,4], indices, changedNodes, node, 5, findit, mouse) // test that it ignores non-selected values

      indices.should.have.length(0)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([false, node])

      manager.selectedNodes.should.not.have.property(2)
      manager.selectedValues.should.not.have.property(2)
    })
  })
})
