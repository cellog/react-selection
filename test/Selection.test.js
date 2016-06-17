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
  })

  describe("updateState", () => {
    const Thing = Selection(Blah)
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
        selectedNodes: [1,2,3],
        selectedValues: [4,5,6],
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: [1,2,3],
        selectedNodeList: [],
        selectedValues: [4,5,6],
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(null, null, null)

      component.state.should.eql({
        selecting: false,
        selectedNodes: [1,2,3],
        selectedNodeList: [],
        selectedValues: [4,5,6],
        selectedValueList: [],
        containerBounds: component.bounds
      })
    })
    it("should set values if passed", () => {
      component.setState({
        selecting: false,
        selectedNodes: [1,2,3],
        selectedValues: [4,5,6],
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: [1,2,3],
        selectedNodeList: [],
        selectedValues: [4,5,6],
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(true, ['hi'], ['there'])

      component.state.should.eql({
        selecting: true,
        selectedNodes: ['hi'],
        selectedNodeList: [],
        selectedValues: ['there'],
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
})
