import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Selectable from '../Selectable.jsx'
import Selection from '../Selection.jsx'
import './example.css'
class Thing extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired,
    thing: React.PropTypes.string.isRequired
  }
  render() {
    let bgColor
    if (this.props.selectable) {
      bgColor = this.props.selected ? 'green' : 'red'
    } else {
      bgColor = 'gray'
    }
    return (
      <div style={{
        width: 50,
        height: 50,
        backgroundColor: bgColor,
        margin: 10}}
      >
        {this.props.thing}
      </div>
    )
  }
}

class Thing2 extends React.Component {
  static propTypes = {
    index: React.PropTypes.number.isRequired,
    thing: React.PropTypes.string.isRequired
  }
  render() {
    return <div style={{
      width: 5,
      height: 2,
      backgroundColor: (this.props.selected ? 'green' : 'red'),
      margin: 3}}
    >
    </div>
  }
}

const SelectableThing = Selectable(Thing, {
  key: (props) => {
    return props.index
  },
  value: (props) => {
    return props.thing
  },
  selectable: (props) => {
    if (props.disabled) return false
    return true
  },
  cacheBounds: true
})

const SelectableThing2 = Selectable(Thing2, {
  key: (props) => {
    return props.index
  },
  value: (props) => {
    return props.thing
  },
  cacheBounds: true
})

const SelectableThing3 = Selectable(Thing2, {
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

const changeCallback = (...props) => {
  console.log('change selection', props)
  return true
}
storiesOf('module.Selectable', module)
  .add('selectable, constant select', () => {
    const Sel = Selection(Test)
    return (
      <Sel selectionOptions={{ constant: true, selectable: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} />
      </Sel>
    )
  })

  .add('selectable, some elements disabled', () => {
    const Sel = Selection(Test)
    return (
      <Sel selectionOptions={{ constant: true, selectable: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
      >
        <SelectableThing thing="hi" index={1}/>
        <SelectableThing thing="there" index={2} />
        <SelectableThing thing="foo" index={3} disabled />
      </Sel>
    )
  })

  .add('selectable, some elements disabled, toggle', () => {
    const Sel = Selection(Test)
    class Moo extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          disabled: true
        }
      }
      render() {
        return (
          <div>
            <button onClick={() => this.setState({ disabled: !this.state.disabled })}>Toggle Disabled</button>
            <Sel selectionOptions={{ constant: true, selectable: true }}
                 selectionCallbacks={{
                   onSelectionChange: changeCallback,
                   onFinishSelect: (...props) => console.log('finish', props)
                 }}
            >
              <SelectableThing thing="hi" index={1}/>
              <SelectableThing thing="there" index={2} />
              <SelectableThing thing="foo" index={3} disabled={this.state.disabled} />
            </Sel>
          </div>
        )
      }
    }
    return <Moo />
  })

  .add('selectable, not constant select', () => {
    const Sel = Selection(Test)
    return (
      <Sel selectionOptions={{selectable: true}}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
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
        selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
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
      <Sel selectionOptions={{ constant: true, selectable: true, preserve: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
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
      <Sel selectionOptions={{ selectable: true, preserve: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
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
      <Sel selectionOptions={{ selectable: true, constant: true, inBetween: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable, additive', () => {
    const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(20).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectionOptions={{ selectable: true, additive: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable, additive, constant select', () => {
    const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(20).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectionOptions={{ selectable: true, additive: true, constant: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable, additive, constant select, fill in gaps', () => {
    const generateThing = (...i) => <SelectableThing thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(20).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectionOptions={{ selectable: true, additive: true, constant: true, inBetween: true }}
           selectionCallbacks={{
             onSelectionChange: changeCallback,
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable, constant select, 1000 nodes, not cached', () => {
    const generateThing = (...i) => <SelectableThing3 thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(1000).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectionOptions={{ selectable: true, constant: true }}
           selectionCallbacks={{
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable, constant select, 1000 nodes', () => {
    const generateThing = (...i) => <SelectableThing2 thing={`hi${i[1]}`} index={i[1]} key={i[1]} />
    const things = Array(1000).fill(0).map(generateThing)

    const Sel = Selection(Test, (a, b) => Number(a) - Number(b))
    return (
      <Sel selectionOptions={{ selectable: true, constant: true }}
           selectionCallbacks={{
             onFinishSelect: (...props) => console.log('finish', props)
           }}
           style={{display: 'flex', flexFlow: 'row wrap', width: '50%'}}>
        {things}
      </Sel>
    )
  })

  .add('selectable table', () => {
    const data = [
      {
        name: 'George',
        sales: 15,
        leads: 12,
        mostPopular: 'Sandbox'
      },
      {
        name: 'Samantha',
        sales: 230,
        leads: 5,
        mostPopular: 'Tricycle'
      },
      {
        name: 'Biff',
        sales: 3,
        leads: 25,
        mostPopular: 'Magazines'
      },
      {
        name: 'Marty',
        sales: 35,
        leads: 2,
        mostPopular: 'Tuna Melt'
      },
    ]
    const Tdraw = ({ children, selected, selectable }) => {
      let classes = ''
      if (selected) classes += 'selected'
      if (!selectable) classes += ' disabled'
      return <td className={classes}>{children}</td>
    }
    const Td = Selectable(Tdraw, {
      key: (props) => `${props.children} td ${props.type}`,
      value: (props) => props.children,
      types: (props) => [props.type]
    })
    const Tr = Selectable(({ row, name, sales, leads, mostPopular, selected, selectable }) => {
      let classes = ''
      if (selected) classes += 'selected'
      if (!selectable) classes += ' disabled'
      return (
        <tr className={classes}>
          <Td type="row">{row}</Td>
          <Td type="name">{name}</Td>
          <Td type="sales">{sales}</Td>
          <Td type="leads">{leads}</Td>
          <Td type="most popular items">{mostPopular}</Td>
        </tr>
      )
    }, {
      key: (props) => `${props.row} row list`,
      value: ({ name, sales, leads, mostPopular }) => {return { name, sales, leads, mostPopular }},
      types: ['row']
    })
    const Tbody = ({ data }) => {
      return (
        <tbody>
          {data.map((person, row) => <Tr key={person.name} row={row} {...person} />)}
        </tbody>
      )
    }
    const th = ({ type, selected }) => (
      <th className={selected ? 'selected' : ''}>{type.split(' ')
        .map(st => st ? st[0].toUpperCase() + st.slice(1) : st)
        .reduce((tot, st) => tot ? tot + ' ' + st : st, '')}</th>
    )
    const Th = Selectable(th, {
      key: (props) => `th.${props.type}`,
      value: (props) => props.value || props.type,
      types: (props) => ['header', props.value || props.type]
    })
    const WholeTh = Selectable(th, {
      key: () => 'th.wholetable',
      value: () => data,
      types: ['table']
    })
    const Table = Selection(({ data }) => {
      return (
        <table style={{borderWidth: 1, borderColor: '#000', borderCollapse: 'collapse'}}>
          <thead>
          <tr>
            <WholeTh type={""} />
            <Th type="people" value="name" />
            <Th type="sales" />
            <Th type="leads" />
            <Th type="most popular items" />
          </tr>
          </thead>
          <Tbody data={data} />
        </table>
      )
    })

    const FullThing = class Foo extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          thing: ''
        }
        this.doSelect = this.doSelect.bind(this)
        this.finishSelect = this.finishSelect.bind(this)
      }

      doSelect(removed, added, acc) {
        let ret = undefined
        let other
        this.setState({ thing: '' })
        let info = 'Selection: '
        const nodes = acc.nodes()
        let nodeinfo = acc.selectedIndices().map(idx => nodes[idx])
        if (!nodeinfo.length) {
          return
        }
        const type = nodeinfo[0].types[0]
        switch (type) {
        case 'row' :
          info += 'Row: '
          info += nodeinfo.reduce((total, { value }) => total ? total + ' ' + JSON.stringify(value) : JSON.stringify(value), '')
          break
        case 'header' :
        case 'table' :
          if (type === 'table') {
            other = nodes.map((node, idx) => idx)
          } else {
            other = nodeinfo
              .map(node => acc.nodeIndicesOfType(node.types[1]))
              .reduce((total, indices) => total.concat(indices), [])
            nodeinfo = other.map(idx => nodes[idx])
          }
          ret = other
        case 'name' :
        case 'sales' :
        case 'leads' :
        case 'most popular items' :
        default:
          info += `${type}: `
          let specifics = nodeinfo.reduce((inf, { value }) => inf ? inf + ',' + JSON.stringify(value) : JSON.stringify(value), '')
          if (type === 'sales' || type === 'leads') {
            const total = nodeinfo.reduce((mytotal, { value }) => mytotal + value, 0)
            const average = total / nodeinfo.length
            specifics += ` Total: ${total}, Average: ${average}`
          }
          info += specifics
          break
        }
        this.setState({ thing: info})
        return ret
      }

      finishSelect() {
        if (this.selectDelay) {
          window.clearTimeout(this.selectDelay)
        }
        this.selectDelay = setTimeout(() => {
          this.setState({ thing: '' })
        }, 1000)
      }

      render() {
        return (
          <div style={{display: 'flex', flexFlow: 'row nowrap'}}>
            <Table
              selectionOptions={{
                selectable: true,
                constant: true,
                acceptedTypes: ['row', 'name', 'sales', 'leads', 'most popular items']
              }}
              data={data}
              selectionCallbacks={{
                onSelectionChange: this.doSelect,
                onFinishSelect: this.finishSelect,
              }}
            />
            <div style={{paddingLeft: 20}}>
              <h1>Stuff</h1>
              <div id="hi">
                {this.state.thing}
              </div>
            </div>
          </div>
        )
      }
    }
    return <FullThing />
  })
