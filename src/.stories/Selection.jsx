import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Selectable from '../Selectable.jsx'
import Selection from '../Selection.jsx'

class Thing extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired,
    thing: React.PropTypes.string.isRequired
  }
  render() {
    return <div style={{
      width: 50,
      height: 50,
      backgroundColor: (this.props.selected ? 'green' : 'red'),
      margin: 10}}
    >
      {this.props.thing}
    </div>
  }
}

const SelectableThing = Selectable(Thing, {
  key: (props) => {
    return props.index
  },
  value: (props) => {
    return props.thing
  }
})

class Test extends React.Component {
  render() {
    return <div style={{width: 100, height: 200, padding: 30, backgroundColor: '#ff8888', ...this.props.style}}>{this.props.children}</div>
  }
}

storiesOf('module.Selectable', module)
  .add('selectable, constant select', () => {
    const Sel = Selection(Test)
    return (
      <Sel constantSelect selectable
           onFinishSelect={(...props) => console.log('finish', props)}
           onSelectSlot={(...props) => console.log('slot', props)}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('selectable, not constant select', () => {
    const Sel = Selection(Test)
    return (
      <Sel selectable
           onFinishSelect={(...props) => console.log('finish', props)}
           onSelectSlot={(...props) => console.log('slot', props)}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('not selectable', () => {
    const Sel = Selection(Test)
    return (
      <Sel
        onFinishSelect={(...props) => console.log('finish', props)}
        onSelectSlot={(...props) => console.log('slot', props)}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('selectable, constant select, preserve selection', () => {
    const Sel = Selection(Test)
    return (
      <Sel constantSelect selectable preserveSelection
           onFinishSelect={(...props) => console.log('finish', props)}
           onSelectSlot={(...props) => console.log('slot', props)}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('selectable, not constant select, preserve selection', () => {
    const Sel = Selection(Test)
    return (
      <Sel selectable preserveSelection
           onFinishSelect={(...props) => console.log('finish', props)}
           onSelectSlot={(...props) => console.log('slot', props)}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('selectable, constant select, intermediate', () => {
    const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(20).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectable constantSelect selectIntermediates
           onFinishSelect={(...props) => console.log('finish', props)}
           onSelectSlot={(...props) => console.log('slot', props)}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

