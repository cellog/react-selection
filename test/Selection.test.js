import 'should'
import $ from 'teaspoon'
import React, { Component, PropTypes } from 'react'

import Selection from '../src/Selection.jsx'
import Selectable from '../src/Selectable.jsx'

describe("Selection", () => {
  const Blah = class A extends Component {
    static displayName = 'A'
    static propTypes = {
      name: PropTypes.string,
      children: PropTypes.any
    }
    render() {
      return (
        <div {...this.props}>
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

    it("should force a container div for a stateless functional component", () => {
      const Thing = Selection(() => null, { containerDiv: false })

      const stuff = $(<Thing />).render()
      expect(stuff[0].containerDiv).to.be.true
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
    const Thing = Selection(Blah, {
      sorter: (a, b) => a > b ? 1 : (a < b ? -1 : 0)
    })
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
        selectedNodes: { 1: 1, 2: 2, 3: 3 },
        selectedValues: { 4: 4, 5: 5, 6: 6 },
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: { 1: 1, 2: 2, 3: 3},
        selectedNodeList: [],
        selectedValues: { 4: 4, 5: 5, 6: 6},
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(null, null, null)

      component.state.should.eql({
        selecting: false,
        selectedNodes: { 1: 1, 2: 2, 3: 3},
        selectedNodeList: [],
        selectedValues: { 4: 4, 5: 5, 6: 6},
        selectedValueList: [],
        containerBounds: component.bounds
      })
    })
    it("should set values if passed", () => {
      component.setState({
        selecting: false,
        selectedNodes: { 1: 1, 2: 2, 3: 3},
        selectedValues: { 4: 4, 5: 5, 6: 6},
        containerBounds: component.bounds
      })

      component.state.should.eql({
        selecting: false,
        selectedNodes: { 1: 1, 2: 2, 3: 3},
        selectedNodeList: [],
        selectedValues: { 4: 4, 5: 5, 6: 6},
        selectedValueList: [],
        containerBounds: component.bounds
      })

      component.updateState(true, { hi: 'hi' }, { there: 'there' })

      component.state.should.eql({
        selecting: true,
        selectedNodes: { hi: 'hi' },
        selectedNodeList: [],
        selectedValues: { there: 'there' },
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
      component.bounds = { hi: 'hi' }
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
      component.bounds = { hi: 'hi' }
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
    let component
    let selectable1
    let selectable2
    let selectable3

    beforeEach(() => {
      spy = sinon.spy()
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
    })

    afterEach(() => {
      stuff.unmount()
    })

    it("should return our info", () => {
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

    it("should call select if constantSelect is active", () => {
      stuff = $(<Thing constantSelect />).render()

      component = stuff[0]

      component.selectionManager.select = spy
      component.start(1, 2, 3)

      expect(spy.called).to.be.true
    })

    it("should call deselect if constantSelect is not active", () => {
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
      stuff = $(<Thing />).render()
      component = stuff[0]
    })

    it("should call deselect", () => {
      component.selectionManager.deselect = spy

      component.cancel()

      expect(spy.called).to.be.true
    })

    it("should call propageFinishedSelect", () => {
      component.propagateFinishedSelect = spy
      component.cancel()

      expect(spy.called).to.be.true
    })

    it("should turn off selection", () => {
      component.setState = spy
      component.cancel()

      expect(spy.called).to.be.true

      spy.args[0][0].should.eql({ selecting: false })
    })
  })

  describe("end", () => {
    const Thing = Selection(Blah)

    it("should call propagateFinishedSelect and deselect if constantSelect is on", () => {
      const stuff = $(<Thing selectable constantSelect />).render()
      const component = stuff[0]
      component.propagateFinishedSelect = sinon.spy()
      component.selectionManager.deselect = sinon.spy()
      component.end(1, 2, 3)

      expect(component.propagateFinishedSelect.called).to.be.true
      expect(component.selectionManager.deselect.called).to.be.true
    })
    it("should select any items in the selection rectangle, and propagateFinishedSelect", () => {
      const stuff = $(<Thing selectable />).render()
      const component = stuff[0]
      component.propagateFinishedSelect = sinon.spy()
      component.selectionManager.select = sinon.spy()
      component.end(1, 2, 3)

      expect(component.propagateFinishedSelect.called).to.be.true
      expect(component.selectionManager.select.called).to.be.true
    })
  })

  describe("change", () => {
    const Thing = Selection(Blah)

    it("should enable selection", () => {
      const stuff = $(<Thing />).render()
      const component = stuff[0]
      component.setState = sinon.spy()

      component.change(1)

      expect(component.setState.called).to.be.true
      component.setState.args[0][0].should.eql({
        selecting: true
      })
    })
    it("should call select if constantSelect is enabled", () => {
      const stuff = $(<Thing constantSelect />).render()
      const component = stuff[0]
      component.selectionManager.select = sinon.spy()

      component.change(1)

      expect(component.selectionManager.select.called).to.be.true
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
    it("should umount inputManager and re-set if ref changes", () => {
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
    it("should create a container div if containerDiv is specified", () => {
      const Thing = Selection(Blah, {
        containerDiv: true
      })
      const Thing2 = Selection(Blah, {
        containerDiv: false
      })

      const a = $(<Thing />).render()
      a.find('div').should.have.length(2)
      const b = $(<Thing2 />).render()
      b.find('div').should.have.length(1)
      a.unmount()
      b.unmount()
    })
    it("should pass in all props", () => {
      const Thing = Selection(Blah)

      const component = $(<Thing another="hi" />).render(true).find(Blah)[0]

      component.props.should.eql({
        clickTolerance: 2,
        constantSelect: false,
        preserveSelection: false,
        selectIntermediates: false,
        selectable: false,
        selectedNodeList: [],
        selectedNodes: {},
        selectedValueList: [],
        selectedValues: {},
        selecting: false,
        another: "hi"
      })
    })
    describe("container div", () => {
      const Thing = Selection(Blah, {
        containerDiv: true
      })
      let stuff
      let component
      beforeEach(() => {
        stuff = $(<Thing />).render(true)
        component = stuff[0]
      })
      afterEach(() => {
        stuff.unmount()
      })
      it("should capture mousedown", () => {
        component.inputManager.mouseDown = sinon.spy()
        stuff.trigger('mouseDown', 5, 5, 5, 5)
        expect(component.inputManager.mouseDown.called).to.be.true
      })
      it("should capture touchstart", () => {
        component.inputManager.touchStart = sinon.spy()
        stuff.trigger('touchStart', 5, 5, 5, 5)
        expect(component.inputManager.touchStart.called).to.be.true
      })
    })
    describe("raw component", () => {
      const Thing = Selection(Blah, {
        containerDiv: false
      })
      let stuff
      let component
      beforeEach(() => {
        stuff = $(<Thing />).render(true)
        component = stuff[0]
      })
      afterEach(() => {
        stuff.unmount()
      })
      it("should capture mousedown", () => {
        component.inputManager.mouseDown = sinon.spy()
        stuff.trigger('mouseDown', 5, 5, 5, 5)
        expect(component.inputManager.mouseDown.called).to.be.true
      })
      it("should capture touchstart", () => {
        component.inputManager.touchStart = sinon.spy()
        stuff.trigger('touchStart', 5, 5, 5, 5)
        expect(component.inputManager.touchStart.called).to.be.true
      })
    })
  })
})
