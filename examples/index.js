import { Selection, Selectable } from 'react-selection-hoc'
import React, { Component, PropTypes } from 'react'
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
    return <div style={{width: '100%', padding: 30, backgroundColor: '#ff8888', ...this.props.style}}>{this.props.children}</div>
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

const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
const things = Array(50).fill(0).map(generateThing)

const Sel2 = Selection(Test, (a, b) => Number(a) - Number(b))

ReactDOM.render((
  <Sel2 selectable constantSelect selectIntermediates style={{display: 'flex', flexFlow: 'row wrap', width: '100%'}}>
    {things}
  </Sel2>
), document.getElementById('example2')
)

class Demo extends Component {
  constructor(props) {
    super(props)

    this.state = {
      constantSelect: false,
      selectable: true,
      preserveSelection: false,
      selectIntermediates: false
    }
  }

  renderCheckboxes() {
    const Checkbox = ({
      name = PropTypes.string.isRequired,
      checked = PropTypes.bool.isRequired
    }) => <label htmlFor={name}>{name} <input type="checkbox" value={checked} checked={checked} onChange={
        () => this.setState({ [name]: !this.state[name] })
      }/></label>
    const ret = []

    for (const name in this.state) {
      ret.push(<Checkbox name={name} checked={this.state[name]} />)
    }
    return ret
  }

  render() {
    return (
      <div>
        {this.renderCheckboxes()}
        <Sel2 {...this.state} style={{display: 'flex', flexFlow: 'row wrap', width: '100%'}}>
          {things}
        </Sel2>
      </div>
    )
  }
}


ReactDOM.render((
    <Demo />
  ), document.getElementById('example3')
)
