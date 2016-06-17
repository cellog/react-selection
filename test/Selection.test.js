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
    beforeEach(() => {
      stuff = $(<Thing></Thing>).render()
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should keep state the same if passed null")
    it("should set values if passed")
    it("should call onSelectSlot if constantSelection is enabled")
    it("should not call onSelectSlot if constantSelection is disabled")
  })
})
