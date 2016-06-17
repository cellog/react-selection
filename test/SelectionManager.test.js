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
      manager.walkNodes([1,2,4], indices, changedNodes, findit, mouse, node, 1)

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
      manager.walkNodes([1,2,4], indices, changedNodes, findit, mouse, node, 3)
      manager.walkNodes([1,2,4], indices, changedNodes, findit, mouse, node, 5) // test that it ignores non-selected values

      indices.should.have.length(0)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([false, node])

      manager.selectedNodes.should.not.have.property(2)
      manager.selectedValues.should.not.have.property(2)
    })
  })

  describe("select", () => {
    let manager
    const notify = {
      updateState: sinon.spy()
    }

    let props
    const mouse = {
      getBoundsForNode(node) {
        return node
      },
      objectsCollide(rect, bounds, tol, key) {
        return rect.indexOf(bounds) !== -1
      }
    }
    const findit = (i) => i
    let node1, node2, node3, node4
    beforeEach(() => {
      props = {
        clickTolerance: 5
      }
      manager = new SelectionManager(notify, props)
      node1 = {
        component: 1,
        key: 1,
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
    })

    it("should select 3 values when within the rectangle", () => {
      manager.select([1,2,4], {selectedNodes: {}, selectedValues: {}}, props, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(4)

      manager.selectedNodes[1].should.eql({bounds: 1, node: 1})
      manager.selectedNodes[2].should.eql({bounds: 2, node: 2})
      manager.selectedNodes[2].should.eql({bounds: 2, node: 2})

      expect(node1.callback.called).to.be.true
      expect(node2.callback.called).to.be.true
      expect(node3.callback.called).to.be.false
      expect(node4.callback.called).to.be.true

      expect(notify.updateState.called).to.be.true
    })

    it("should select 4 values with selectIntermediates", () => {
      props.selectIntermediates = true

      manager.select([1,2,4], {selectedNodes: {}, selectedValues: {}}, props, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(4)

      manager.selectedNodes[1].should.eql({bounds: 1, node: 1})
      manager.selectedNodes[2].should.eql({bounds: 2, node: 2})
      manager.selectedNodes[3].should.eql({bounds: 3, node: 3})
      manager.selectedNodes[4].should.eql({bounds: 4, node: 4})

      expect(node1.callback.called).to.be.true
      expect(node2.callback.called).to.be.true
      expect(node3.callback.called).to.be.true
      expect(node4.callback.called).to.be.true

      expect(notify.updateState.called).to.be.true
    })
  })

  describe("deselect", () => {
    let manager
    const notify = {
      updateState: sinon.spy()
    }
    const props = {
      clickTolerance: 5
    }
    manager = new SelectionManager(notify, props)
    it("should remove all selected items and update state", () => {
      manager.selectedNodes = {
        'hi': {}
      }
      manager.selectedValues = {
        'hi': {}
      }
      manager.selectables.hi = {
        callback: sinon.spy()
      }
      manager.deselect({
        selectedNodes: {
          'hi': {}
        }
      })

      manager.selectedNodes.should.eql({})
      manager.selectedValues.should.eql({})
      expect(manager.selectables.hi.callback.called).to.be.true
      expect(notify.updateState.called).to.be.true
    })
  })
})
