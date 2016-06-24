import { Selection, Selectable, Debug } from 'react-selection-hoc'
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
  <Sel selectionOptions={{ constant: true, selectable: true }}>
    <SelectableThing thing="hi" index={1}/>
    <SelectableThing thing="there" index={2} />
    <SelectableThing thing="foo" index={3} />
  </Sel>
), document.getElementById('example1'))

if (!Array.prototype.fill) {
  Array.prototype.fill = function(value) {

    // Steps 1-2.
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined ?
      len : end >> 0;

    // Step 11.
    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);

    // Step 12.
    while (k < final) {
      O[k] = value;
      k++;
    }

    // Step 13.
    return O;
  };
}

const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
const things = Array(50).fill(0).map(generateThing)

const Sel2 = Selection(Test, (a, b) => Number(a) - Number(b))

ReactDOM.render((
  <Sel2 selectionOptions={{ selectable: true, constant: true, inBetween: true }} style={{display: 'flex', flexFlow: 'row wrap', width: '100%'}}>
    {things}
  </Sel2>
), document.getElementById('example2')
)

class Demo extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectionOptions: {
        additive: false,
        constant: false,
        selectable: true,
        preserve: false,
        inBetween: false
      },
    }
  }

  renderCheckboxes() {
    const Checkbox = ({
      name = PropTypes.string.isRequired,
      checked = PropTypes.bool.isRequired
    }) => <div><label htmlFor={name}>{name} <input type="checkbox" value={checked} checked={checked} onChange={
        () => this.setState({ selectionOptions: { [name]: !this.state[name] } })
      }/></label></div>
    const ret = []

    for (const name in this.state.selectionOptions) {
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
