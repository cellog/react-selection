import { Selection, Selectable } from 'react-selection-hoc'
import React from 'react'
import ReactDOM from 'react-dom'

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
const Sel = Selection(Test)

ReactDOM.render((
  <Sel constantSelect selectable>
    <SelectableThing thing="hi" index={1}/>
    <SelectableThing thing="there" index={2} />
    <SelectableThing thing="foo" index={3} />
  </Sel>
), document.getElementById('example1'))