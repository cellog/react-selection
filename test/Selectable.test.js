import 'should'
import $ from 'teaspoon'
import React, { Component, PropTypes } from 'react'

import Selectable from '../src/Selectable.jsx'
import SelectionManager from '../src/SelectionManager.js'
import selectedList from '../src/selectedList.js'

describe("Selectable", () => {
  class Blah extends Component {
    static propTypes = {
      selected: PropTypes.bool,
      id: PropTypes.number,
      value: PropTypes.string,
      children: PropTypes.element
    }
    render() {
      return (
        <div key={this.props.id}>
          <p>hi {this.props.value} {this.props.selected ? <span>selected</span> : ''}</p>
          {this.props.children}
        </div>
      )
    }
  }

  const Blah2 = ({ selected = false, id, value, children }) => (
    <div key={id}>
      hi {value} {selected ? <span>selected</span> : ''}
      {children}
    </div>
  )

  Blah2.displayName = 'Blah2'
  Blah2.propTypes = {
    selected: PropTypes.bool,
    id: PropTypes.number,
    value: PropTypes.string,
    children: PropTypes.element
  }

  describe("higher-order container creation", () => {
    it("should make a component from a React class", () => {
      const Thing = Selectable(Blah, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })
      Thing.displayName.should.match(/Selectable\((Blah|Component)\)/)

      const stuff = $(<Thing value="me"><div className="foo">hi</div></Thing>).render(true)

      stuff.find('.foo').text().should.eql('hi')

      const nextstuff = $(<Thing value="Greg" />).render()

      nextstuff.find('p').text().should.eql('hi Greg ')
      stuff.unmount()
      nextstuff.unmount()
    })

    it("should make a reffable component from a stateless functional component", () => {
      const Thing = Selectable(Blah2, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })

      const spy = sinon.spy()

      const stuff = $(<Thing ref={spy} />).render(true)
      expect(spy.called).to.be.true
      spy.args[0][0].should.equal(stuff[0])

      stuff.unmount()
    })

    it("should error if a non-component is passed in", () => {
      expect(() => {
        Selectable(false)
      }).to.throw('Component is not a class, must be a stateful React Component class')
    })

    it("should pull displayname from displayName", () => {
      const Thing = Selectable( class {
        static displayName = 'Hi'
        render() {}
      }, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })
      Thing.displayName.should.equal('Selectable(Hi)')
    })

    it("should display the Container for a stateless functional component", () => {
      const Thing = Selectable(Blah2, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })
      Thing.displayName.should.equal('Selectable(ReferenceableContainer(Blah2))')
    })

    it("should pull displayname from name if displayName is not present", () => {
      const Thing = Selectable( class Hi {
        render() {}
      }, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })
      Thing.displayName.should.match(/^Selectable\((Hi|Component)\)$/) // IE 10/11
    })
  })

  describe("selection", () => {
    it("should set the selected prop when selected", () => {
      const Thing1 = Selectable(Blah, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })
      const Thing2 = Selectable(Blah2, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })

      const r1 = $(<Thing1 value="Greg" />).render(true)
      r1.text().should.eql('hi Greg ')
      r1[0].selectItem(true)
      r1.text().should.eql('hi Greg selected')
      r1.unmount()

      const r2 = $(<Thing2 value="Hyeyung" />).render(true)
      r2.text().should.eql('hi Hyeyung ')
      r2[0].selectItem(true)
      r2.text().should.eql('hi Hyeyung selected')
      r2.unmount()
    })
  })

  describe("registration", () => {
    class Foo extends React.Component {
      static propTypes = {
        children: PropTypes.any
      }

      static childContextTypes = {
        selectionManager: PropTypes.object
      }

      constructor(props) {
        super(props)
        this.selectionManager = {
          registerSelectable: sinon.spy(),
          unregisterSelectable: sinon.spy()
        }
      }

      getChildContext() {
        return {
          selectionManager: this.selectionManager
        }
      }

      render() {
        return <div>{this.props.children}</div>
      }
    }
    it("should call registerSelectable on context.selectionManager", () => {
      const Thing1 = Selectable(Blah, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })

      const thing = $(<Foo><Thing1 value="Greg" id={1} /></Foo>).render(true)

      expect(thing[0].selectionManager.registerSelectable.called).to.be.true
      thing.unmount()
    })
    it("should call options.key, options.value", () => {
      const spy1 = sinon.spy()
      const spy2 = sinon.spy()
      const Thing1 = Selectable(Blah, {
        key: (props) => {
          spy1()
          return props.id
        },
        value: (props) => {
          spy2()
          return props.value
        },
        cacheBounds: true
      })

      const thing = $(<Foo><Thing1 value="Greg" id={1} /></Foo>).render(true)

      expect(spy1.called).to.be.true
      expect(spy2.called).to.be.true
      thing.unmount()
    })
    it("should set up unregistration on unmount", () => {
      const Thing1 = Selectable(Blah, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })

      const thing = $(<Foo><Thing1 value="Greg" id={1} /></Foo>).render(true)
      expect(thing[0].selectionManager.unregisterSelectable.called).to.be.false
      thing.find(Thing1)[0].componentWillUnmount()
      expect(thing[0].selectionManager.unregisterSelectable.called).to.be.true

      thing.unmount()
    })
    it("should call unregistration on unmount", () => {
      const Thing1 = Selectable(Blah, {
        key: (props) => props.id,
        value: (props) => props.value,
        cacheBounds: true
      })

      const thing = $(<Foo><Thing1 value="Greg" id={1} /></Foo>).render(true)

      expect(thing[0].selectionManager.unregisterSelectable.called).to.be.false
      thing.unmount()
      expect(thing[0].selectionManager.unregisterSelectable.called).to.be.true
    })
  })

  describe("register", () => {
    let manager
    const Comp = () => <div>this is it</div>
    const props = {
      selectionOptions: {}
    }
    beforeEach(() => {
      manager = new SelectionManager({}, new selectedList, props)
    })
    it("should call selectionManager's registerSelectable with the results of options on props passed in", () => {
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => props.canSelect,
        types: (props) => props.types,
        value: (props) => props.val
      })

      const stuff = $(<Sel id="boo" canSelect={false} types={['one', 'two']} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      const spy = component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(spy.called).to.be.true
      spy.args[0][0].should.equal(component)
      spy.args[0][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: false,
        types: ['one', 'two'],
        value: 'hillbilly'
      })
    })
    it("should use default types of ['__default'] if none is specified", () => {
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => props.canSelect,
        value: (props) => props.val
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      const spy = component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(spy.called).to.be.true
      spy.args[0][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: false,
        types: ['__default'],
        value: 'hillbilly'
      })
    })
    it("should process options['type'] and call function or read value", () => {
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => props.canSelect,
        value: (props) => props.val,
        types: ['other']
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      const spy = component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(spy.called).to.be.true
      spy.args[0][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: false,
        types: ['other'],
        value: 'hillbilly'
      })
    })
    it("should call options['key']", () => {
      const keyspy = sinon.spy()
      const Sel = Selectable(Comp, {
        key: (props) => {
          keyspy(props)
          return props.id
        },
        selectable: (props) => props.canSelect,
        value: (props) => props.val,
        types: ['other']
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(keyspy.called).to.be.true
      keyspy.args[0][0].should.equal(component.props)
    })
    it("should call options['value']", () => {
      const valuespy = sinon.spy()
      const Sel = Selectable(Comp, {
        value: (props) => {
          valuespy(props)
          return props.val
        },
        selectable: (props) => props.canSelect,
        key: (props) => props.id,
        types: ['other']
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(valuespy.called).to.be.true
      valuespy.args[0][0].should.equal(component.props)
    })
    it("should use the optional selectable param if it is non-null", () => {
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => props.canSelect,
        value: (props) => props.val
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      const spy = component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props, true)

      expect(spy.called).to.be.true
      spy.args[0][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: true,
        types: ['__default'],
        value: 'hillbilly'
      })
    })
  })

  describe("changeSelectable", () => {
    let manager
    const Comp = () => <div>this is it</div>
    const props = {
      selectionOptions: {}
    }
    beforeEach(() => {
      manager = new SelectionManager({}, new selectedList, props)
    })

    it("should re-register with selectionManager and set state", () => {
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => props.canSelect,
        value: (props) => props.val
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      const spy = component.context.selectionManager.registerSelectable = sinon.spy()
      component.register(component.props)

      expect(spy.called).to.be.true
      spy.args[0][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: false,
        types: ['__default'],
        value: 'hillbilly'
      })

      expect(component.state.selectable).to.be.false
      component.changeSelectable(true)
      expect(component.state.selectable).to.be.true

      expect(spy.called).to.be.true
      spy.args[1][1].should.eql({
        cacheBounds: undefined,
        callback: component.selectItem,
        key: 'boo',
        selectable: true,
        types: ['__default'],
        value: 'hillbilly'
      })
    })
  })

  describe("componentWillReceiveProps", () => {
    let manager
    const Comp = () => <div>this is it</div>
    const props = {
      selectionOptions: {}
    }
    beforeEach(() => {
      manager = new SelectionManager({}, new selectedList, props)
    })

    it("should re-call register and set selectable state", () => {
      const selectableSpy = sinon.spy()
      const Sel = Selectable(Comp, {
        key: (props) => props.id,
        selectable: (props) => {
          selectableSpy(props)
          return props.canSelect
        },
        value: (props) => props.val
      })

      const stuff = $(<Sel id="boo" canSelect={false} val="hillbilly" />).render()

      const component = stuff[0]
      component.context = {
        selectionManager: manager
      }
      component.register = sinon.spy()
      component.componentWillReceiveProps({
        id: 'boo',
        canSelect: true,
        val: 'hillbilly'
      })
      expect(component.state.selectable).to.be.true
      expect(component.register.called).to.be.true
      expect(selectableSpy.called).to.be.true
    })
  })
})
