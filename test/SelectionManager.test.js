import 'should'

import SelectionManager from '../src/SelectionManager.js'
import selectedList from '../src/selectedList.js'

describe("SelectionManager", function() {
  describe("construction", () => {
    it("should set notify and clickTolerance", () => {
      const notify = {

      }
      const props = {
        clickTolerance: 5
      }
      const manager = new SelectionManager(notify, new selectedList, props)
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
      manager = new SelectionManager(notify, new selectedList, props)
    })

    it("should throw if attempting to register a component with no key", () => {
      expect(() => {
        manager.registerSelectable({}, { value: 'hi' })
      }).to.throw(`component registered with undefined key, value is ${JSON.stringify('hi')}`)
    })

    it("should add the component to our lists, no bounds cached", () => {
      const thing = {}
      const callback = () => null
      manager.registerSelectable(thing, {
        key: 'hi',
        selectable: true,
        value: 4,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.sortedNodes.should.eql([{
        component: thing,
        selectable: true,
        value: 4,
        key: 'hi',
        types: { default: 1},
        callback,
        bounds: null
      }], 'sortedNodes')
      manager.selectables.should.have.property('hi')
      manager.selectables.hi.should.eql({
        component: thing,
        selectable: true,
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
        selectable: true,
        value: 4,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.sortedNodes.should.eql([{
        component: thing,
        selectable: true,
        value: 4,
        key: 'hi',
        types: { default: 1},
        callback,
        bounds: null
      }])

      manager.registerSelectable(thing, {
        key: 'hi',
        selectable: false,
        value: 5,
        callback,
        types: { default: 1},
        cacheBounds: false
      })
      manager.sortedNodes.should.eql([{
        component: thing,
        selectable: false,
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
        selectable: true,
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: true
      }, math, findit)
      manager.sortedNodes.should.eql([{
        component: thing,
        selectable: true,
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
        selectable: true,
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })
      manager.registerSelectable(thing2, {
        key: 'hi2',
        selectable: true,
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })
      manager.registerSelectable(thing3, {
        key: 'hi3',
        selectable: true,
        value: 4,
        types: ['default'],
        callback,
        cacheBounds: false
      })

      manager.indexMap.should.eql({ hi: 0, hi2: 1, hi3: 2 })
      manager.sortedNodes.should.eql([
        {
          component: thing1,
          selectable: true,
          value: 4,
          key: 'hi',
          types: ['default'],
          callback,
          bounds: null
        },
        {
          component: thing2,
          selectable: true,
          value: 4,
          key: 'hi2',
          types: ['default'],
          callback,
          bounds: null
        },
        {
          component: thing3,
          selectable: true,
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
      manager = new SelectionManager(notify, new selectedList, props)
      manager.registerSelectable(thing, {
        key: 'hi',
        value: 4,
        callback,
        cacheBounds: false
      })
    })

    it("should remove an existing item", () => {
      manager.sortedNodes.should.have.length(1)
      manager.unregisterSelectable(thing, 'hi')
      manager.sortedNodes.should.have.length(0)
    })

    it("should notify if removing affects the current selection", () => {
      manager.sortedNodes.should.have.length(1)
      manager.selectedList.selectedIndices = [0]
      manager.unregisterSelectable(thing, 'hi')
      manager.sortedNodes.should.have.length(0)

      expect(notify.updateState.called).to.equal(true)
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
        clickTolerance: 5,
        selectionOptions: {},
        selectionCallbacks: {}
      }
      manager = new SelectionManager(notify, new selectedList, props)
      node1 = {
        component: 1,
        selectable: true,
        key: 1,
        types: ['default'],
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        selectable: true,
        types: ['default'],
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        selectable: true,
        types: ['default'],
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        selectable: true,
        types: ['default'],
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
      manager.indexMap = { 1: 0, 2: 1, 3: 2, 4: 3 }
      manager.selectedList.setNodes(manager.sortedNodes)
    })

    it("should select 3 values when within the rectangle", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 2, y: 1, top: 2}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 1, 3])
    })

    it("should select 4 values with inBetween", () => {
      props.selectionOptions.inBetween = true

      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 2, y: 1, top: 2}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 1, 2, 3])
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
        clickTolerance: 5,
        selectionOptions: {},
        selectionCallbacks: {}
      }
      manager = new SelectionManager(notify, new selectedList, props)
      node1 = {
        component: 1,
        selectable: true,
        key: 1,
        types: ['default', 'second'],
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        selectable: true,
        types: ['third'],
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        selectable: true,
        types: ['default', 'third'],
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        selectable: true,
        types: ['second', 'fourth'],
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
      manager.indexMap = { 1: 0, 2: 1, 3: 2, 4: 3 }
      manager.selectedList.setNodes(manager.sortedNodes)
    })

    it("should register the types of the first node selected (#1)", () => {
      manager.selectedList.begin([], props)
      expect(manager.selectedList.transaction.firstNode).is.false
      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      expect(manager.selectedList.transaction.firstNode).equal(node1)

      manager.select({
        selectionRectangle: {sub: [2, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)
      expect(manager.selectedList.transaction.firstNode).equal(node1)
      manager.selectedList.commit()
      expect(manager.selectedList.transaction.firstNode).is.undefined
    })

    it("should register the types of the first node selected (#1)", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [2, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      expect(manager.selectedList.transaction.firstNode).equal(node2)

      manager.select({
        selectionRectangle: {sub: [1, 2, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      expect(manager.selectedList.transaction.firstNode).equal(node2)
      manager.selectedList.selectedIndices.should.eql([1])
      manager.selectedList.commit()
    })

    it("should select nodes that are the same type as the first selected node only (#1)", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 2, 3])
    })


    it("should select nodes in acceptedTypes prop", () => {
      const myprops = {
        ...props,
        acceptedTypes: ['third']
      }
      manager.begin(myprops)
      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1},
        props: myprops
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([1, 2])
    })

    it("should select nodes that are the same type as the first selected node only (#2)", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([1, 2])
    })

    it("should select nodes that are the same type as the first selected node only (#3)", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 1, 2])
    })

    it("should select nodes that are the same type as the first selected node only (#4)", () => {
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 3])
    })
  })

  describe("additive selection mode", () => {
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
        clickTolerance: 5,
        selectionOptions: {
          selectable: true,
          additive: true
        },
        selectionCallbacks: {}
      }
      manager = new SelectionManager(notify, new selectedList, props)
      node1 = {
        component: 1,
        selectable: true,
        key: 1,
        types: ['default'],
        bounds: false,
        callback: sinon.spy()
      }
      node2 = {
        component: 2,
        selectable: true,
        types: ['default'],
        key: 2,
        bounds: false,
        callback: sinon.spy()
      }
      node3 = {
        component: 3,
        selectable: true,
        types: ['default'],
        key: 3,
        bounds: false,
        callback: sinon.spy()
      }
      node4 = {
        component: 4,
        selectable: true,
        types: ['default'],
        key: 4,
        bounds: false,
        callback: sinon.spy()
      }
      manager.sortedNodes = [node1, node2, node3, node4]
      manager.indexMap = { 1: 0, 2: 1, 3: 2, 4: 3 }
    })

    it("should select normally on the first run", () => {
      manager.selectedList.setNodes(manager.sortedNodes)
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)
      manager.commit()

      manager.selectedList.selectedIndices.should.eql([2, 3])
    })

    it("should de-select previously selected items on the second run, and select newly selected ones", () => {
      manager.selectedList.setNodes(manager.sortedNodes)
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.commit()
      manager.selectedList.selectedIndices.should.eql([ 2, 3])

      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([ 0, 1])
    })

    it("should work with constant select", () => {
      manager.selectedList.setNodes(manager.sortedNodes)
      props.selectionOptions.constant = true

      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([0, 1, 2, 3])

      manager.commit()
      manager.begin(props)

      manager.select({
        selectionRectangle: {sub: [3, 4], x: 1, left: 1, y: 1, top: 1},
        props
      }, findit, mouse)

      manager.commit()

      manager.selectedList.selectedIndices.should.eql([0, 1])

      manager.begin(props)

      manager.select({
        selectionRectangle: {sub: [1, 2, 3], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([2])

      manager.select({
        selectionRectangle: {sub: [1, 2, 3], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.commit()
      manager.selectedList.selectedIndices.should.eql([2])
    })

    it("should work with inBetween", () => {
      manager.selectedList.setNodes(manager.sortedNodes)
      props.selectionOptions.inBetween = true

      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 4], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.commit()

      manager.selectedList.selectedIndices.should.eql([0, 1, 2, 3])
    })
    it("should work with inBetween and constant select", () => {
      manager.selectedList.setNodes(manager.sortedNodes)
      props.selectionOptions.inBetween = true
      props.selectionOptions.constant = true

      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)
      manager.selectedList.selectedIndices.should.eql([0])

      manager.commit()
      manager.begin(props)
      manager.select({
        selectionRectangle: {sub: [1, 3], x: 1, left: 1, y: 1, top: 1}, props
      }, findit, mouse)

      manager.selectedList.selectedIndices.should.eql([1, 2])
      manager.commit()
    })
  })

  describe("deselect", () => {
    let manager
    const notify = {
      updateState: sinon.spy()
    }
    const props = {
      clickTolerance: 5,
      selectionOptions: {}
    }
    manager = new SelectionManager(notify, new selectedList, props)
    it("should remove all selected items and update state", () => {
      const spy = {
        key: 'hi',
        callback: sinon.spy()
      }
      manager.selectedList.setNodes([spy])
      manager.selectedList.selectedIndices = [0]
      manager.deselect({})

      expect(spy.callback.called).to.be.true
    })
  })

  describe("cancelSelection", () => {
    let selectedList
    let manager
    beforeEach(() => {
      selectedList = {
        cancelIndices: sinon.spy(),
        removeNodes: sinon.spy()
      }
      manager = new SelectionManager({}, selectedList, {
        clickTolerance: 5
      })
    })

    it("should call cancelIndices if indices is passed", () => {
      manager.cancelSelection({ indices: [2]})

      expect(selectedList.cancelIndices.called).to.be.true
      expect(selectedList.removeNodes.called).to.be.false
      selectedList.cancelIndices.args[0][0].should.eql([2])
    })
    it("should call removeNodes if indices is not passed and nodes is", () => {
      manager.cancelSelection({ nodes: [2]})

      expect(selectedList.cancelIndices.called).to.be.false
      expect(selectedList.removeNodes.called).to.be.true
      selectedList.removeNodes.args[0][0].should.eql([2])
    })
  })
})
