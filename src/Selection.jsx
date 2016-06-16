import mouseMath from './mouseMath.js'
import Debug from './debug.js'
import InputManager from './InputManager.js'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

function makeSelectable( Component, options = {}) {
  const { containerDiv = true, sorter = (a, b) => a - b, nodevalue = (node) => node.props.value } = options
  if (!Component) throw new Error("Component is undefined")
  const displayName = Component.displayName || Component.name || 'Component'

  return class extends React.Component {
    static displayName = `Selection(${displayName})`
    constructor(props) {
      super(props)
      this.mouseDownData = null
      this.clickTolerance = 2
      this.selectables = {}
      this.selectableKeys = []
      this.sortedNodes = []
      this.containerDiv = containerDiv
      this.state = {
        selecting: false,
        selectedNodes: {},
        selectedNodeList: [],
        selectedValues: {},
        selectedValueList: []
      }
    }

    static propTypes = {
      clickTolerance: PropTypes.number,
      constantSelect: PropTypes.bool,
      selectable: PropTypes.bool,
      preserveSelection: PropTypes.bool,
      selectIntermediates: PropTypes.bool,
      onSelectSlot: PropTypes.func,
      onFinishSelect: PropTypes.func,
      onMouseDown: PropTypes.func,
      onTouchStart: PropTypes.func
    }

    static defaultProps = {
      clickTolerance: 2,
      constantSelect: false,
      selectable: false,
      preserveSelection: false,
      selectIntermediates: false
    }

    static childContextTypes = {
      registerSelectable: PropTypes.func,
      unregisterSelectable: PropTypes.func,
      selectedNodes: PropTypes.object,
      selectedValues: PropTypes.object
    }

    updateState(selecting, nodes, values) {
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log('updatestate: ', selecting, nodes, values)
      }
      const newnodes = nodes === null ? this.state.selectedNodes : nodes
      const newvalues = values === null ? this.state.selectedValues : values
      this.setState({
        selecting: selecting === null ? this.state.selecting : selecting,
        selectedNodes: newnodes,
        selectedValues: newvalues,
        containerBounds: this.bounds
      })
      if (this.props.onSelectSlot || this.props.onFinishSelect) {
        const nodelist = Object.keys(newnodes).map((key) => newnodes[key]).sort((a, b) => nodevalue(a.node) - nodevalue(b.node))
        const valuelist = Object.keys(newvalues).map((key) => newvalues[key]).sort(sorter)
        if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
          Debug.log('updatestate onSelectSlot', values, nodes, valuelist, nodelist, this.bounds)
        }
        if (this.props.onSelectSlot) {
          this.props.onSelectSlot(values, () => nodes, valuelist, () => nodelist, this.bounds)
        }
      }
    }

    propagateFinishedSelect() {
      if (!this.props.onFinishSelect) return
      const newnodes = this.state.selectedNodes
      const newvalues = this.state.selectedValues
      const nodelist = Object.keys(newnodes).map((key) => newnodes[key]).sort((a, b) => sorter(nodevalue(a.node), nodevalue(b.node)))
      const valuelist = Object.keys(newvalues).map((key) => newvalues[key]).sort(sorter)
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log('finishselect', newvalues, newnodes, valuelist, nodelist, this.bounds)
      }
      this.props.onFinishSelect(newvalues, () => newnodes, valuelist, () => nodelist, this.bounds)
    }

    getChildContext() {
      return {
        registerSelectable: (component, key, value, callback) => {
          if (!this.selectables.hasOwnProperty(key)) {
            this.selectableKeys.push(key)
            this.sortedNodes.push({ component, key, value, callback } )
          }
          if (Debug.DEBUGGING.debug && Debug.DEBUGGING.registration) {
            Debug.log(`registered: ${key}`, value)
          }
          this.selectables[key] = { component, value, callback }
        },
        unregisterSelectable: (component, key) => {
          delete this.selectables[key]
          this.selectableKeys = this.selectableKeys.filter((itemKey) => itemKey !== key)
          if (this.state.selectedNodes[key]) {
            const nodes = this.state.selectedNodes
            const values = this.state.selectedValues
            delete nodes[key]
            delete values[key]
            this.updateState(null, nodes, values)
          }
        },
        selectedNodes: this.state.selectedNodes,
        selectedValues: this.state.selectedValues
      }
    }

    componentWillUnmount() {
      if (this.inputManager) {
        this.inputManager.unmount()
      }
    }

    invalid(e, eventname) {
      if (eventname === 'touchstart') {
        if (this.props.onTouchStart) {
          this.props.onTouchStart(e)
        }
      } else {
        if (this.props.onMouseDown) {
          this.props.onMouseDown(e)
        }
      }
    }

    start(bounds, mouseDownData, selectionRectangle) {
      this.bounds = bounds
      this.mouseDownData = mouseDownData
      this._selectRect = selectionRectangle
      if (this.props.constantSelect) {
        this.selectNodes()
      }
    }

    cancel() {
      this.deselectNodes()
      this.propagateFinishedSelect()
      this.setState({ selecting: false })
    }

    end(e, mouseDownData, selectionRectangle) {
      this._selectRect = selectionRectangle
      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.propagateFinishedSelect()
        this.deselectNodes()
        return
      }
      this.selectNodes()
    }

    change(selectionRectangle) {
      const old = this.state.selecting

      if (!old) {
        this.setState({selecting: true})
      }

      this._selectRect = selectionRectangle
      if (this.props.constantSelect) {
        this.selectNodes()
      }
    }

    deselectNodes() {
      let changed = false
      Object.keys(this.state.selectedNodes).forEach((key) => {
        changed = true
        this.selectables[key].callback(false, {}, {})
      })
      if (changed) {
        this.updateState(false, {}, {})
      }
    }

    selectNodes() {
      const nodes = {...this.state.selectedNodes}
      const values = {...this.state.selectedValues}
      const changedNodes = []
      const selectedIndices = []
      const saveNode = (node, bounds) => {
        if (nodes[node.key] !== undefined) return
        if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
          Debug.log(`select: ${node.key}`)
        }
        nodes[node.key] = {node: node.component, bounds: bounds}
        values[node.key] = node.value
        changedNodes.push([true, node])
      }

      this.sortedNodes.forEach((node, idx) => {
        const domnode = findDOMNode(node.component)
        const key = node.key
        const bounds = mouseMath.getBoundsForNode(domnode)
        if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
          Debug.log(`node ${key} bounds`, bounds)
        }
        if (!domnode || !mouseMath.objectsCollide(this._selectRect, bounds, this.clickTolerance, key)) {
          if (!nodes.hasOwnProperty(key)) return
          if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
            Debug.log(`deselect: ${key}`)
          }
          delete nodes[key]
          delete values[key]
          changedNodes.push([false, node])
          return
        }
        selectedIndices.push(idx)
        saveNode(node, bounds)
      })
      if (this.props.selectIntermediates) {
        const min = Math.min(...selectedIndices)
        const max = Math.max(...selectedIndices)
        const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
        filled.unshift(min)
        const diff = filled.filter(val => selectedIndices.indexOf(val) === -1)
        diff.forEach(idx => saveNode(this.sortedNodes[idx], mouseMath.getBoundsForNode(findDOMNode(this.sortedNodes[idx].component))))
      }
      if (changedNodes.length) {
        changedNodes.forEach((item) => {
          if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
            Debug.log('start callback')
          }
          item[1].callback(item[0], nodes, values)
          if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
            Debug.log('end callback')
          }
        })
        this.updateState(null, nodes, values)
      }
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
        Debug.log('end of selectNodes')
      }
    }

    makeInputManager(ref) {
      if (!ref) return
      this.inputManager = new InputManager(ref, this, this)
    }

    render() {
      if (this.containerDiv) {
        return (
          <div
            ref={(ref) => this.makeInputManager(ref)}
          >
            <Component
              {...this.props}
              {...this.state}
            />
          </div>
        )
      }
      return (
        <Component
          {...this.props}
          {...this.state}
          ref={(ref) => this.makeInputManager(ref)}
        />
      )
    }
  }
}

export default makeSelectable
