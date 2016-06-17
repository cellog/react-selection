import 'should'
import $ from 'teaspoon'
import Selection from '../src/Selection.jsx'
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
    it("should call onSelectSlot if constantSelection is enabled")
    it("should not call onSelectSlot if constantSelection is disabled")
  })
})
