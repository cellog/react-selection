import 'should'
import $ from 'teaspoon'
import React, { Component, PropTypes } from 'react'

import Selection from '../src/Selection.jsx'
import Selectable from '../src/Selectable.jsx'
import { mouseEvent, dispatchEvent, touchEvent, createTouch } from './simulateMouseEvents.js'
import { spies } from '../src/InputManager.js'

describe("Selection", () => {
  const Blah = class A extends Component {
    static displayName = 'A'
    static propTypes = {
      name: PropTypes.string,
      children: PropTypes.any
    }
    render() {
      return (
        <div {...this.props} style={{position: 'absolute', top: 0, height: 50, width: 50}}>
          <p>hi! {this.props.name}</p>
          {this.props.children}
        </div>
      )
    }
  }
  const Blah2 = ({ name, children }) => {
    return (
      <div style={{position: 'absolute', top: 0, height: 50, width: 50}}>
        <p>hi... {name}</p>
        {children}
      </div>
    )
  }
  Blah2.propTypes = {
    name: PropTypes.string,
    children: PropTypes.any
  }
  Blah2.displayName = 'A'
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

      const stuff = $(<Thing><div className="foo">high</div></Thing>).render()

      stuff.find('.foo').text().should.eql('high')

      const nextstuff = $(<Thing name="Greg" />).render()

      nextstuff.find('p').text().should.eql('hi! Greg')
      stuff.unmount()
      nextstuff.unmount()
    })

    it("should error if a non-component is passed in", () => {
      expect(() => {
        Selection(false)
      }).to.throw('Component is not a class, must be a stateful React Component class')
    })

    it("should error if a wrapped component does not have any elements", () => {
      expect(() => {
        const Thing = Selection(() => null)

        $(<Thing />).render()
      }).to.throw('Selection components must have elements as children, not null (in Selection(ReferenceableContainer(Component)))')
    })

    it("should pull displayname from displayName", () => {
      const Thing = Selection( class {
        static displayName = 'Hi'
        render() {}
      })
      Thing.displayName.should.equal('Selection(Hi)')
    })

    it("should pull displayname from name if displayName is not present", () => {
      const Thing = Selection( class Hi {
        render() {}
      })
      Thing.displayName.should.match(/^Selection\((Hi|Component)\)$/) // IE 10/11
    })
  })

  describe("updateState", () => {
    const Thing = Selection(Blah)
    let stuff
    let component
    beforeEach(() => {
      stuff = $(<Thing />).render()
      component = stuff[0]
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should keep state the same if passed null", () => {
      component.setState({
        selecting: false,
        selectedIndices: [],
        containerBounds: component.bounds
      })

      component.updateState(null)

      component.state.should.eql({
        selecting: false,
        selectedIndices: [],
        containerBounds: component.bounds
      })
    })

    it("should call onSelectionChange if selectionOptions.constant is enabled", () => {
      const spy = sinon.spy()
      stuff.unmount()
      stuff = $((
        <Thing selectionOptions={{ selectable: true, constant: true }} selectionCallbacks={{
          onSelectionChange: (...args) => {
            spy(...args)
            return true
          }
        }}>
          <SelectableChild value="hi" id={1} />
          <SelectableChild value="hi2" id={2} />
          <SelectableChild value="hi3" id={3} />
        </Thing>
          )).render()
      component = stuff[0]
      component.bounds = { hi: 'hi' }

      component.selectionManager.selecting = true
      component.selectedList.removed = [0]
      component.selectedList.added = [2]
      component.updateState(null)

      expect(spy.called).to.be.true

      spy.args[0].should.have.length(3)
      spy.args[0][0].should.be.eql([0])
      spy.args[0][1].should.be.eql([2])
      spy.args[0][2].should.equal(component.selectedList.accessor)
    })

    it("should not call onSelectionChange if selectionOptions.constant is disabled", () => {
      const spy = sinon.spy()
      stuff.unmount()
      stuff = $((
        <Thing selectionOptions={{selectable: true}} selectionCallbacks={{
          onSelectionChange: spy
        }}>
          <SelectableChild value="hi" id={1} />
          <SelectableChild value="hi2" id={2} />
          <SelectableChild value="hi3" id={3} />
        </Thing>
      )).render()
      component = stuff[0]
      component.bounds = { hi: 'hi' }

      component.updateState(null)

      expect(spy.called).to.be.false
    })
  })

  describe("propagateFinishedSelect", () => {
    const Thing = Selection(Blah)
    let spy
    let stuff
    let component

    beforeEach(() => {
      spy = sinon.spy()
      stuff = $((
        <Thing selectionOptions={{ selectable: true, constant: true }}
               selectionCallbacks={{ onFinishSelect: spy }}>
        <SelectableChild value="hi" id={1}/>
        <SelectableChild value="hi2" id={2}/>
        <SelectableChild value="hi3" id={3}/>
        </Thing>
      )).render()
      component = stuff[0]
      component.bounds = {hi: 'hi'}
    })

    afterEach(() => {
      stuff.unmount()
    })

    it("should return our info", () => {
      component.selectedList.selectedIndices = [0, 1, 2]
      component.updateState(null)

      component.propagateFinishedSelect()

      expect(spy.called).to.be.true

      spy.args[0].should.have.length(3)
      spy.args[0][0].should.be.eql([0, 1, 2])
      expect(spy.args[0][1]).to.equal(component.selectedList)
      expect(spy.args[0][2]).to.equal(component.bounds)
    })
  })

  describe("invalid", () => {
    const Thing = Selection(Blah)
    let spy
    let stuff
    let component

    beforeEach(() => {
      spy = sinon.spy()
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should call onTouchStart if defined and event is a touch event", () => {
      stuff = $(<Thing onTouchStart={spy}/>).render(true)

      component = stuff[0]
      component.invalid('hi', 'touchstart')

      expect(spy.called).to.be.true
    })
    it("should call onMouseDown if defined and event is a mouse event", () => {
      stuff = $(<Thing onMouseDown={spy}/>).render(true)

      component = stuff[0]
      component.invalid('hi', 'mousedown')

      expect(spy.called).to.be.true
    })
  })

  describe("start", () => {
    const Thing = Selection(Blah)
    let spy
    let stuff
    let component

    beforeEach(() => {
      spy = sinon.spy()
    })

    it("should call select if selectionOptions.constant is active", () => {
      stuff = $(<Thing selectionOptions={{ constant: true }} />).render()

      component = stuff[0]

      component.selectionManager.select = spy
      component.start(1, 2, 3)

      expect(spy.called).to.be.true
    })

    it("should call deselect if selectionOptions.constant is not active", () => {
      stuff = $(<Thing />).render()

      component = stuff[0]

      component.selectionManager.deselect = spy
      component.start(1, 2, 3)

      expect(spy.called).to.be.true
    })
  })

  describe("cancel", () => {
    const Thing = Selection(Blah)
    let spy
    let stuff
    let component

    beforeEach(() => {
      spy = sinon.spy()
      stuff = $(<Thing />).render(true)
      component = stuff[0]
    })
    afterEach(() => {
      stuff.unmount()
    })

    it("should call deselect", () => {
      component.selectionManager.begin(component.props)
      component.selectionManager.deselect = spy

      component.cancel()

      expect(spy.called).to.be.true
    })

    it("should turn off selection", () => {
      component.selectionManager.begin(component.props)
      component.setState = spy
      component.cancel()

      expect(spy.called).to.be.true

      spy.args[0][0].should.eql({ selecting: false })
    })
  })

  describe("end", () => {
    const Thing = Selection(Blah)

    it("should call propagateFinishedSelect and deselect if selectionOptions.constant is on", () => {
      const stuff = $(<Thing selectionOptions={{ selectable: true, constant: true }} />).render()
      const component = stuff[0]
      component.selectionManager.begin(component.props)
      component.propagateFinishedSelect = sinon.spy()
      component.selectionManager.deselect = sinon.spy()
      component.end(1, 2, 3)

      expect(component.propagateFinishedSelect.called).to.be.true
      expect(component.selectionManager.deselect.called).to.be.true
    })

    it("should select any items in the selection rectangle, and propagateFinishedSelect", () => {
      const stuff = $(<Thing selectable />).render()
      const component = stuff[0]
      component.selectionManager.begin(component.props)
      component.propagateFinishedSelect = sinon.spy()
      component.selectionManager.select = sinon.spy()
      component.end(1, 2, 3)

      expect(component.propagateFinishedSelect.called).to.be.true
      expect(component.selectionManager.select.called).to.be.true
    })
  })

  describe("change", () => {
    const Thing = Selection(Blah)
    let i
    let setit
    const mouse = {
      getBoundsForSelection: (thing) => {
        return thing
      },
      objectsCollide: () => {
        if (!setit) return false
        if (i++) {
          return true
        }
        return false
      }
    }
    const findit = () => { return { hi: 'hi' }}
    beforeEach(() => {
      setit = false
      i = 1
    })

    it("should enable selection", () => {
      const stuff = $(<Thing />).render()
      const component = stuff[0]
      component.setState = sinon.spy()

      component.change(1)

      expect(component.setState.called).to.be.true
      component.setState.args[0][0].should.eql({
        selecting: true
      })
      stuff.unmount()
    })
    it("should call select if selectionOptions.constant is enabled", () => {
      const stuff = $(<Thing selectionOptions={{ selectable: true, constant: true }} />).render()
      const component = stuff[0]
      component.selectionManager.select = sinon.spy()

      component.change(1)

      expect(component.selectionManager.select.called).to.be.true
      stuff.unmount()
    })
    it("should call updateState if the selection changed, constant is enabled", () => {
      const stuff = $(<Thing selectionOptions={{ selectable: true, constant: true }}>
        <SelectableChild id={1} value="hi" />
        <SelectableChild id={2} value="hi2" />
        </Thing>).render()
      const component = stuff[0]
      component.updateState = sinon.spy()
      component.selectionManager.begin(component.props)
      component.change({
        x: 1, y: 1, top: 2, left: 2
      }, findit, mouse)
      expect(component.updateState.called).to.be.false
      setit = true
      component.change({
        x: 1, y: 1, top: 2, left: 2
      }, findit, mouse)
      expect(component.updateState.called).to.be.true
      stuff.unmount()
    })
  })

  describe("makeInputManager", () => {
    const Thing = Selection(Blah)

    it("should do nothing if ref is null", () => {
      const spy = sinon.spy()

      const im = function(...args) {
        spy(...args)
      }

      const stuff = $(<Thing />).render()
      stuff[0].makeInputManager(null, im)

      expect(spy.called).to.be.false
    })
    it("should set up inputManager and ref on first valid call", () => {
      const spy = sinon.spy()
      let watch = null

      const im = function(...args) {
        spy(...args)
        watch = this
      }

      const stuff = $(<Thing />).render()
      const component = stuff[0]
      component.makeInputManager('hi', im)

      expect(spy.called).to.be.true
      watch.should.equal(component.inputManager)
      component.ref.should.equal('hi')
    })
    it("should do nothing if ref is the same as a previous call", () => {
      const spy = sinon.spy()

      const im = function(...args) {
        spy(...args)
      }

      const stuff = $(<Thing />).render()
      const component = stuff[0]
      component.makeInputManager('hi', im)
      component.makeInputManager('hi', im)

      expect(spy.calledOnce).to.be.true
    })
    it("should unmount inputManager and re-set if ref changes", () => {
      const spy = sinon.spy()
      const spy2 = sinon.spy()

      class im {
        constructor(...args) {
          spy(...args)
        }
        unmount(...args) {
          spy2(...args)
        }
      }

      const stuff = $(<Thing />).render()
      const component = stuff[0]
      component.makeInputManager('hi', im)
      component.makeInputManager('hi2', im)

      expect(spy.calledTwice).to.be.true
      expect(spy2.called).to.be.true
    })
  })

  describe("render", () => {
    it("should pass in all props", () => {
      const Thing = Selection(Blah)

      const stuff = $(<Thing another="hi" />).render(true)
      const component = stuff.find(Blah)[0]

      component.props.should.eql({
        clickTolerance: 2,
        selectionOptions: {
          selectable: false,
          constant: false,
          preserve: false,
          inBetween: false
        },
        selectionCallbacks: {},
        selectedIndices: [],
        selecting: false,
        another: "hi"
      })
      stuff.unmount()
    })
    describe("(stateful) React Class-based Component", () => {
      const Thing = Selection(Blah)
      let stuff
      beforeEach(() => {
        spies.mouseDown = sinon.spy()
        spies.touchStart = sinon.spy()
        stuff = $(<Thing />).render(true)
      })
      afterEach(() => {
        stuff.unmount()
        spies.mouseDown = false
        spies.touchStart = false
      })
      it("should capture mousedown", () => {
        const ev = mouseEvent('mousedown', 5, 5, 5, 5)
        dispatchEvent(stuff.dom(), ev)
        expect(spies.mouseDown.called).to.be.true
      })
      it("should capture touchstart", () => {
        const element = stuff.dom()
        const touches = [createTouch(element, 5, 5, 1)]
        const ev = touchEvent('touchstart', touches)
        dispatchEvent(element, ev)
        expect(spies.touchStart.called).to.be.true
      })
    })
    describe("stateless functional component, wrapped in ReferenceableContainer", () => {
      const Thing = Selection(Blah2)
      let stuff
      beforeEach(() => {
        spies.mouseDown = sinon.spy()
        spies.touchStart = sinon.spy()
        stuff = $(<Thing />).render(true)
      })
      afterEach(() => {
        stuff.unmount()
        spies.mouseDown = false
        spies.touchStart = false
      })
      it("should capture mousedown", () => {
        const ev = mouseEvent('mousedown', 5, 5, 5, 5)
        dispatchEvent(stuff.dom(), ev)
        expect(spies.mouseDown.called).to.be.true
      })
      it("should capture touchstart", () => {
        const element = stuff.dom()
        const touches = [createTouch(element, 5, 5, 1)]
        const ev = touchEvent('touchstart', touches)
        dispatchEvent(element, ev)
        expect(spies.touchStart.called).to.be.true
      })
    })
  })
})
