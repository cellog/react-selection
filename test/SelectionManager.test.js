import 'should'

import SelectionManager from '../src/SelectionManager.js'

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
      manager.registerSelectable(thing, {
        key: 'hi',
        value: 4,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        types: { default: 1},
        callback,
        bounds: null
      }], 'sortedNodes')
      manager.selectables.should.have.property('hi')
      manager.selectables.hi.should.eql({
        component: thing,
        key: 'hi',
        value: 4,
        types: { default: 1},
        callback,
        bounds: null
      }, 'selectables')
    })

    it("should replace an element if duplicate key specified", () => {
      const thing = {}
      const callback = () => null
      manager.registerSelectable(thing, {
        key: 'hi',
        value: 4,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        types: { default: 1},
        callback,
        bounds: null
      }])

      manager.registerSelectable(thing, {
        key: 'hi',
        value: 5,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 5,
        key: 'hi',
        types: { default: 1},
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
      manager.registerSelectable(thing, {
        key: 'hi',
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: true
      }, math, findit)
      manager.selectableKeys.should.eql(['hi'])
      manager.sortedNodes.should.eql([{
        component: thing,
        value: 4,
        key: 'hi',
        types: ['default'],
        callback,
        bounds: 'foobar'
      }])
    })

    it("should add the components in the order they are called", () => {
      const thing1 = {}
      const thing2 = {}
      const thing3 = {}
      const callback = () => null
      manager.registerSelectable(thing1, {
        key: 'hi',
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })
      manager.registerSelectable(thing2, {
        key: 'hi2',
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })
      manager.registerSelectable(thing3, {
        key: 'hi3',
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })

      manager.selectableKeys.should.eql(['hi', 'hi2', 'hi3'])
      manager.indexMap.should.eql({ hi: 0, hi2: 1, hi3: 2 })
      manager.sortedNodes.should.eql([
        {
          component: thing1,
          value: 4,
          key: 'hi',
          types: ['default'],
          callback,
          bounds: null
        },
        {
          component: thing2,
          value: 4,
          key: 'hi2',
          types: ['default'],
          callback,
          bounds: null
        },
        {
          component: thing3,
          value: 4,
          key: 'hi3',
          types: ['default'],
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
      manager.registerSelectable(thing, {
        key: 'hi',
        value: 4,
        callback,
        cacheBounds: false
      })
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
      manager.saveNode(changedNodes, thing, bounds, {
        x: 1, left: 1, y: 1, top: 1
      }, props)

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
      const rect = {x: 1, left: 2, y: 1, top: 2}
      manager.saveNode(changedNodes, thing, bounds, rect, props)
      manager.saveNode(changedNodes, thing, bounds, rect, props)

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
      objectsCollide(rect, bounds) {
        return rect.sub.indexOf(bounds) !== -1
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
      manager.walkNodes({
        selectionRectangle: {sub: [1, 2, 4], x: 1, y: 1, left: 1, top: 1},
        selectedIndices: indices,
        changedNodes,
        props, findit, mouse
      }, node, 1)

      indices.should.have.length(1)
      indices[0].should.equal(1)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([true, node])
    })

    it("should sort nodes in reverse within the rect if the user selected from bottom to top", () => {
      const indices = [34]
      const changedNodes = []
      const node = {
        component: 2,
        key: 2,
        bounds: false
      }
      const mouse = {
        getBoundsForNode(node) {
          return node
        },
        objectsCollide(rect, bounds) {
          return rect.sub.indexOf(bounds) !== -1
        }
      }
      manager.walkNodes({
        selectionRectangle: {sub: [1, 2, 4], x: 4, left: 4, y: 5, top: 5},
        selectedIndices: indices,
        changedNodes, props, findit, mouse
      }, node, 1)

      indices.should.have.length(2)
      indices[0].should.equal(1)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([true, node])
    })

    it("should sort nodes forward within the rect if the user selected from bottom to top", () => {
      const indices = [34]
      const changedNodes = []
      const node = {
        component: 2,
        key: 2,
        bounds: false
      }
      const props = {}
      const mouse = {
        getBoundsForNode(node) {
          return node
        },
        objectsCollide(rect, bounds) {
          return rect.sub.indexOf(bounds) !== -1
        }
      }
      manager.walkNodes({
        selectionRectangle: {sub: [1, 2, 4], x: 4, left: 2, y: 5, top: 6},
        selectedIndices: indices,
        changedNodes,
        props,
        findit,
        mouse
      }, node, 1)

      indices.should.have.length(2)
      indices[1].should.equal(1)

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
      const rect = {sub: [1, 2, 4], x: 1, y: 1, left: 1, top: 1}
      manager.selectedNodes[2] = {}
      manager.selectedValues[2] = {}
      manager.selectedNodeList = [manager.selectedNodes[2]]
      manager.selectedValueList = [manager.selectedValues[2]]
      manager.walkNodes({
        selectionRectangle: rect,
        selectedIndices: indices,
        changedNodes,
        props: {},
        findit,
        mouse
      }, node, 3)
      manager.walkNodes({
        selectionRectangle: rect,
        selectedIndices: indices,
        changedNodes,
        props: {},
        findit,
        mouse
      }, node, 5) // test that it ignores non-selected values

      indices.should.have.length(0)

      changedNodes.should.have.length(1)
      changedNodes[0].should.eql([false, node])

      manager.selectedNodes.should.not.have.property(2)
      manager.selectedValues.should.not.have.property(2)
      manager.selectedNodeList.should.have.length(0)
      manager.selectedValueList.should.have.length(0)
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
      objectsCollide(rect, bounds) {
        return rect.sub.indexOf(bounds) !== -1
      }
    }
    const findit = (i) => i
    let node1
    let node2
    let node3
    let node4
    beforeEach(() => {
      props = {
        clickTolerance: 5
      }
      manager = new SelectionManager(notify, props)
      node1 = {
        component: 1,
        key: 1,
        types: ['default'],
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        types: ['default'],
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        types: ['default'],
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        types: ['default'],
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
      manager.indexMap = { 1: 0, 2: 1, 3: 2, 4: 3 }
    })

    it("should select 3 values when within the rectangle", () => {
      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 2, y: 1, top: 2},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(4)

      manager.selectedNodes[1].should.eql({bounds: 1, node: 1})
      manager.selectedNodes[2].should.eql({bounds: 2, node: 2})
      manager.selectedNodes[4].should.eql({bounds: 4, node: 4})

      expect(node1.callback.called).to.be.true
      expect(node2.callback.called).to.be.true
      expect(node3.callback.called).to.be.false
      expect(node4.callback.called).to.be.true

      expect(notify.updateState.called).to.be.true
    })

    it("should select 4 values with selectIntermediates", () => {
      props.selectIntermediates = true

      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 2, y: 1, top: 2},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

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

  describe("select: selection types", () => {
    let manager
    const notify = {
      updateState: sinon.spy()
    }

    let props
    const mouse = {
      getBoundsForNode(node) {
        return node
      },
      objectsCollide(rect, bounds) {
        return rect.sub.indexOf(bounds) !== -1
      }
    }
    const findit = (i) => i
    let node1
    let node2
    let node3
    let node4
    beforeEach(() => {
      props = {
        clickTolerance: 5
      }
      manager = new SelectionManager(notify, props)
      node1 = {
        component: 1,
        key: 1,
        types: ['default', 'second'],
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        types: ['third'],
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        types: ['default', 'third'],
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        types: ['second', 'fourth'],
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
      manager.indexMap = { 1: 0, 2: 1, 3: 2, 4: 3 }
    })

    it("should register the types of the first node selected (#1)", () => {
      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      expect(manager.firstNode).equal(node1)

      manager.select({
        selectionRectangle: {sub: [2, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)
      expect(manager.firstNode).equal(node1)
    })

    it("should register the types of the first node selected (#1)", () => {
      manager.select({
        selectionRectangle: {sub: [2, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      expect(manager.firstNode).equal(node2)

      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      expect(manager.firstNode).equal(node2)
    })

    it("should select nodes that are the same type as the first selected node only (#1)", () => {
      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(3)
      manager.selectedNodes.should.have.property(4)
    })


    it("should select nodes in acceptedTypes prop", () => {
      const myprops = {
        ...props,
        acceptedTypes: ['third']
      }
      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        },
        props: myprops
      }, findit, mouse)

      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(3)
    })

    it("should select nodes that are the same type as the first selected node only (#2)", () => {
      manager.select({
        selectionRectangle: {sub: [2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(3)
    })

    it("should select nodes that are the same type as the first selected node only (#3)", () => {
      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(2)
      manager.selectedNodes.should.have.property(3)
    })

    it("should select nodes that are the same type as the first selected node only (#4)", () => {
      manager.select({
        selectionRectangle: {sub: [4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        currentState: {
          selectedNodes: {},
          selectedValues: {},
          selectedNodeList: [],
          selectedValueList: []
        }, props
      }, findit, mouse)

      manager.selectedNodes.should.have.property(1)
      manager.selectedNodes.should.have.property(4)
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
