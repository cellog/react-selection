import 'should'
import $ from 'teaspoon'
import Selection from '../src/Selection.jsx'
import Selectable from '../src/Selectable.jsx'
import React, { Component, PropTypes } from 'react'

describe("Selection", () => {
  const Blah = class A extends Component {
    static displayName = 'A'
    static propTypes = {
      name: PropTypes.string,
      children: PropTypes.any
    }
    render() {
      return (
        <div>
          <p>hi {this.props.name}</p>
          {this.props.children}
        </div>
      )
    }
  }
  const Child = class B extends Component {
    static displayName='B'
    static propTypes = {
      value: PropTypes.string,
      id: PropTypes.number
    }
    render() {
      return <div key={this.props.id}>{this.props.value}</div>
    }
  }
  const options = {
    value: (props) => props.value,
    key: (props) => props.id,
    cacheBounds: true
  }
  const SelectableChild = Selectable(Child, options)
  describe("higher-order container creation", () => {
    it("should make a component", () => {
      const Thing = Selection(Blah)
      Thing.displayName.should.be.eql('Selection(A)')

      const stuff = $(<Thing><div className="foo">hi</div></Thing>).render()

      stuff.find('.foo').text().should.eql('hi')

      const nextstuff = $(<Thing name="Greg" />).render()

      nextstuff.find('p').text().should.eql('hi Greg')
    })

    it("should error if a non-component is passed in", () => {
      expect(() => {
        Selection(false)
      }).to.throw('Component is not a class, must be a stateful React Component class')
    })

    it("should force a container div for ", () => {
      const Thing = Selection(() => null, { containerDiv: false })
      
      const stuff = $(<Thing />).render()
      expect(stuff[0].containerDiv).to.be.true
    })

    it("should pull displayname from displayName", () => {
      const Thing = Selection(class {
        static displayName = 'Hi'
        render() {}
      })
      Thing.displayName.should.equal('Selection(Hi)')
    })

    it("should pull displayname from name if displayName is not present", () => {
      const Thing = Selection(class Hi {
        render() {}
      })
      Thing.displayName.should.match(/^Selection\((Hi|Component)\)$/) // IE 10/11
    })
  })

  describe("updateState", () => {
    const Thing = Selection(Blah, {
      sorter: (a, b) => a > b ? 1 : (a < b ? -1 : 0)
    })
    let stuff
    let component
    beforeEach(() => {
      stuff = $(<Thing></Thing>).render()
      component = stuff[0]
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should keep state the same if passed null", () => {
      component.setState({
        selecting: false,
        selectedNodes: {1:1,2:2,3:3},
        selectedValues: {4:4,5:5,6:6},
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: {1:1,2:2,3:3},
        selectedNodeList: [],
        selectedValues: {4:4,5:5,6:6},
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(null, null, null)

      component.state.should.eql({
        selecting: false,
        selectedNodes: {1:1,2:2,3:3},
        selectedNodeList: [],
        selectedValues: {4:4,5:5,6:6},
        selectedValueList: [],
        containerBounds: component.bounds
      })
    })
    it("should set values if passed", () => {
      component.setState({
        selecting: false,
        selectedNodes: {1:1,2:2,3:3},
        selectedValues: {4:4,5:5,6:6},
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: {1:1,2:2,3:3},
        selectedNodeList: [],
        selectedValues: {4:4,5:5,6:6},
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(true, {hi:'hi'}, {there:'there'})

      component.state.should.eql({
        selecting: true,
        selectedNodes: {hi:'hi'},
        selectedNodeList: [],
        selectedValues: {there:'there'},
        selectedValueList: [],
        containerBounds: component.bounds
      })
    })

    it("should call onSelectSlot if constantSelect is enabled", () => {
      const spy = sinon.spy()
      stuff = $((
        <Thing selectable constantSelect onSelectSlot={spy}>
          <SelectableChild value="hi" key={1} />
          <SelectableChild value="hi2" key={2} />
          <SelectableChild value="hi3" key={3} />
        </Thing>
          )).render()
      const children = stuff.find(SelectableChild)
      component = stuff[0]
      component.bounds = {hi:'hi'}
      const selectable1 = children[0]
      const selectable2 = children[1]
      const selectable3 = children[2]

      component.updateState(null, {
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      }, {
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      })

      expect(spy.called).to.be.true

      spy.args[0].should.have.length(5)
      spy.args[0][0].should.be.eql({
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      })
      expect(spy.args[0][1]()).to.eql({
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      })
      expect(spy.args[0][2]).to.eql(['hi', 'hi2', 'hi3'])
      expect(spy.args[0][3]()).to.eql([
        {node: selectable1},
        {node: selectable2},
        {node: selectable3}
      ])
      expect(spy.args[0][4]).to.eql({hi: 'hi'})
    })
    it("should not call onSelectSlot if constantSelection is disabled", () => {
      const spy = sinon.spy()
      stuff = $((
        <Thing selectable onSelectSlot={spy}>
          <SelectableChild value="hi" key={1} />
          <SelectableChild value="hi2" key={2} />
          <SelectableChild value="hi3" key={3} />
        </Thing>
      )).render()
      const children = stuff.find(SelectableChild)
      component = stuff[0]
      component.bounds = {hi:'hi'}
      const selectable1 = children[0]
      const selectable2 = children[1]
      const selectable3 = children[2]

      component.updateState(null, {
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      }, {
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      })

      expect(spy.called).to.be.false
    })
  })

  describe("propagateFinishedSelect", () => {
    const Thing = Selection(Blah, {
      sorter: (a, b) => a > b ? 1 : (a < b ? -1 : 0)
    })
    let spy
    let stuff
    let component, selectable1, selectable2, selectable3
    let nodes, values

    beforeEach(() => {
      spy = sinon.spy()
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should return our info", () => {
      stuff = $((
        <Thing selectable constantSelect onFinishSelect={spy}>
          <SelectableChild value="hi" key={1}/>
          <SelectableChild value="hi2" key={2}/>
          <SelectableChild value="hi3" key={3}/>
        </Thing>
      )).render()
      component = stuff[0]
      const children = stuff.find(SelectableChild)
      component = stuff[0]
      component.bounds = {hi: 'hi'}
      selectable1 = children[0]
      selectable2 = children[1]
      selectable3 = children[2]
      nodes = {
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      }
      values = {
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      }
      component.updateState(null, {
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      }, {
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      })

      component.propagateFinishedSelect()

      expect(spy.called).to.be.true

      spy.args[0].should.have.length(5)
      spy.args[0][0].should.be.eql({
        3: 'hi3',
        1: 'hi',
        2: 'hi2'
      })
      expect(spy.args[0][1]()).to.eql({
        3: {node: selectable3},
        1: {node: selectable1},
        2: {node: selectable2}
      })
      expect(spy.args[0][2]).to.eql(['hi', 'hi2', 'hi3'])
      expect(spy.args[0][3]()).to.eql([
        {node: selectable1},
        {node: selectable2},
        {node: selectable3}
      ])
      expect(spy.args[0][4]).to.eql({hi: 'hi'})
    })
  })

  describe("invalid", () => {
    it("should call onTouchStart if defined and event is a touch event")
    it("should call onMouseDown if defined and event is a mouse event")
  })

  describe("start", () => {
    it("should call select if constantSelect is active")
    it("should call deselect if constantSelect is not active")
  })

  describe("cancel", () => {
    it("should call deselect")
    it("should call propageFinishedSelect if present")
    it("should turn off selection")
  })
  
  describe("end", () => {
    it("should call propagateFinishedSelect and deselect if constantSelect is on")
    it("should select any items in the selection rectangle, and propagateFinishedSelect")
  })

  describe("change", () => {
    it("should enable selection")
    it("should call select if constantSelect is enabled")
  })

  describe("makeInputManager", () => {
    it("should do nothing if ref is null")
    it("should set up inputManager and ref on first valid call")
    it("should do nothing if ref is the same as a previous call")
    it("should umount inputManager and re-set if ref changes")
  })

  describe("render", () => {
    it("should create a container div if ")
  })
})
