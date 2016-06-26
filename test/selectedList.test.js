import selectedList from '../src/selectedList.js'

describe("selectedList", () => {
  let sel
  beforeEach(() => {
    sel = new selectedList
  })
  describe("xor", () => {
    it("should deselect common items", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [2, 3]

      sel.xor(newOnes, oldOnes).should.eql([1, 4])
    })

    it("should select not in common items from the end of the new array", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [2, 3, 4, 5]

      sel.xor(newOnes, oldOnes).should.eql([1, 5])
    })

    it("should select not in common items from the start of new array", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [0, 1, 2, 3, 4]

      sel.xor(newOnes, oldOnes).should.eql([0])
    })

    it("should select not in common items from the middle of new array", () => {
      const oldOnes = [0, 2, 4, 6]
      const newOnes = [1, 2, 3, 4, 5, 6]

      sel.xor(newOnes, oldOnes).should.eql([0, 1, 3, 5])
    })
  })

  describe("or", () => {
    it("should select all items in common, with no duplicates", () => {
      const oldOnes = [0, 2, 4, 6]
      const newOnes = [1, 2, 3, 4, 5, 6]

      sel.or(newOnes, oldOnes).should.eql([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe("removed", () => {
    it("should select all items removed from the old list", () => {
      const oldOnes = [0, 2, 3, 6]
      const newOnes = [0, 1, 3, 4, 5]

      sel.changed(newOnes, oldOnes).should.eql([2, 6])
    })
  })

  describe("added", () => {
    it("should select all items removed from the old list", () => {
      const oldOnes = [0, 2, 3, 6]
      const newOnes = [0, 1, 3, 4, 5]

      sel.changed(oldOnes, newOnes).should.eql([1, 4, 5])
    })
  })

  describe("accessor", () => {
    const node1 = {
      key: 'key1',
      value: 'value1',
      component: {},
      types: ['first', 'third']
    }
    const node2 = {
      key: 'key2',
      value: 'value2',
      component: {},
      types: ['second', 'another']
    }
    const node3 = {
      key: 'key3',
      value: 'value3',
      component: {},
      types: ['third', 'another']
    }
    let list
    beforeEach(() => {
      list = new selectedList
      list.nodes = [node1, node2, node3]
      list.bounds = [1, 2, 3]
    })
    describe("nodes", () => {
      it("should return a copy of nodes, but not the same array", () => {
        const test = list.accessor.nodes()
        test.should.eql(list.nodes)
        test.should.not.equal(list.nodes)
        test.pop()
        test.should.not.eql(list.nodes)
      })
    })
    describe("node", () => {
      it("should return the node at the specified index", () => {
        list.accessor.node(0).should.equal(node1)
        list.accessor.node(1).should.equal(node2)
        list.accessor.node(2).should.equal(node3)
      })
    })
    describe("nodeIndicesOfType", () => {
      it("should return a list of indices of all nodes that have that type in DOM order", () => {
        list.accessor.nodeIndicesOfType('first').should.eql([0])
        list.accessor.nodeIndicesOfType('second').should.eql([1])
        list.accessor.nodeIndicesOfType('third').should.eql([0, 2])
        list.accessor.nodeIndicesOfType('another').should.eql([1, 2])
      })
    })
    describe("selectedIndices", () => {
      it("should return a copy of selectedIndices in DOM order, but not the same array", () => {
        list.selectedIndices = [0, 1]
        const test = list.accessor.selectedIndices()
        test.should.eql(list.selectedIndices)
        test.should.not.equal(list.selectedIndices)
        test.pop()
        test.should.not.eql(list.selectedIndices)
      })
    })
    describe("selectedNodeList", () => {
      it("should return an array of all the selected react components in DOM order", () => {
        list.selectedIndices = [0, 1]
        list.accessor.selectedNodeList().should.eql([node1.component, node2.component])
      })
    })
    describe("selectedValueList", () => {
      it("should return an array of all the selected values in DOM order", () => {
        list.selectedIndices = [0, 1]
        list.accessor.selectedValueList().should.eql([node1.value, node2.value])
      })
    })
    describe("selectedNodes", () => {
      it("should return an array of all the selected react components and their bounds in DOM order as an object indexed by key", () => {
        list.selectedIndices = [0, 1]
        list.accessor.selectedNodes().should.eql({
          key1: {
            node: node1.component,
            bounds: list.bounds[0]
          },
          key2: {
            node: node2.component,
            bounds: list.bounds[1]
          }
        })
      })
    })
    describe("selectedValues", () => {
      it("should return an array of all the selected values in DOM order as an object indexed by key", () => {
        list.selectedIndices = [0, 1]
        list.accessor.selectedValues().should.eql({
          key1: node1.value,
          key2: node2.value
        })
      })
    })
  })

  describe("revert", () => {
    it("should add and remove the items in the removed/added arrays to reverse previous selection", () => {
      const list = new selectedList
      list.removed = [0, 1]
      list.added = [2]
      list.addItem = sinon.spy()
      list.removeItem = sinon.spy()

      list.revert()

      expect(list.addItem.callCount).to.eql(2)
      expect(list.removeItem.callCount).to.eql(1)

      list.addItem.args[0][0].should.eql(0)
      list.addItem.args[0][1].should.equal(list.selectedIndices)

      list.addItem.args[1][0].should.eql(1)
      list.addItem.args[1][1].should.equal(list.selectedIndices)

      list.removeItem.args[0][0].should.eql(2)
      list.removeItem.args[0][1].should.equal(list.selectedIndices)
    })
  })

  describe("setSelection", () => {
    it("should adjust state as if the selected indices passed in were selected by the user", () => {
      const list = new selectedList
      list.selectedIndices = [3, 4]
      list.transaction = {
        additionalSelectionMap: {},
        previousMostRecentSelection: [2, 3]
      }

      const indices = [0, 1, 2]
      list.setSelection(indices)

      list.mostRecentSelection.should.eql(indices)
      list.selectedIndices.should.eql(indices)
      list.removed.should.eql([3])
      list.added.should.eql([0, 1])
    })
  })

  describe("testNodes", () => {
    it("should set bounds to false if no dom node is available", () => {
      const list = new selectedList
      list.selectItem = sinon.spy()
      list.deselectItem = sinon.spy()
      list.testNodes({
        findit: () => false
      }, {}, 0)

      expect(list.selectItem.called).to.be.false
      expect(list.deselectItem.called).to.be.true
    })

    it("should get bounds if the node bounds are not set", () => {
      const list = new selectedList
      const spy = sinon.spy()
      list.selectItem = sinon.spy()
      list.deselectItem = sinon.spy()
      list.testNodes({
        findit: () => 3,
        mouse: {
          getBoundsForNode(arg) {
            spy(arg)
            return false
          }
        }
      }, {}, 0)

      expect(list.selectItem.called).to.be.false
      expect(list.deselectItem.called).to.be.true
      expect(spy.called).to.be.true
      spy.args[0][0].should.eql(3)
    })
  })

  describe("selectItem", () => {
    it("should ignore unselectable items", () => {
      const list = new selectedList
      list.setNodes([{selectable: false}])
      list.addItem = sinon.spy()

      list.selectItem(0)
      expect(list.addItem.called).to.be.false
    })
  })

  describe("removeItem", () => {
    it("should use splice to remove the item", () => {
      const list = new selectedList
      list.selectedIndices = [0, 3, 5]
      list.removeItem(3)
      list.selectedIndices.should.eql([0, 5])
    })
  })

  describe("notifyChangedNodes", () => {
    // this just increases coverage
    const list = new selectedList
    list.setNodes([
      {}, {}
    ])
    list.removed = [0]
    list.added = [1]
    list.notifyChangedNodes()
  })

  describe("selectItemsInRectangle", () => {
    it("should setup transaction as fail-safe", () => {
      const list = new selectedList
      list.transaction.should.eql({})
      const begin = list.begin.bind(list)
      const spy = sinon.spy()
      list.begin = (a) => {
        spy(a)
        return begin(a)
      }
      list.testNodes = () => null

      list.selectItemsInRectangle({}, {
        selectionOptions: {}
      })
      expect(spy.called).to.be.true
      list.transaction.should.eql({
        additionalSelectionMap: {},
        firstNode: false,
        mostRecentSelection: [],
        previousSelection: []
      })
    })

    it("should use the additionalSelectionMap value", () => {
      const list = new selectedList
      list.transaction.should.eql({})
      const begin = list.begin.bind(list)
      const spy = sinon.spy()
      list.begin = (a) => {
        spy(a)
        return begin(a)
      }
      list.testNodes = () => null
      list.begin([], {
        selectionOptions: {}
      })
      list.transaction.additionalSelectionMap[''] = [0, 1, 2]

      list.selectItemsInRectangle({}, {
        selectionOptions: {}
      })
      list.selectedIndices.should.eql([0, 1, 2])
    })
  })
})
