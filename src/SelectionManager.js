import mouseMath from './mouseMath.js'
import Debug from './debug.js'
import { findDOMNode } from 'react-dom'

export default class SelectionManager {
  constructor(notify, props) {
    this.clickTolerance = props.clickTolerance
    this.selectables = {}
    this.selectableKeys = []
    this.sortedNodes = []
    this.selectedNodes = {}
    this.selectedValues = {}
    this.notify = notify
  }

  deselect(currentState) {
    let changed = false
    Object.keys(currentState.selectedNodes).forEach((key) => {
      changed = true
      this.selectables[key].callback(false, {}, {})
    })
    if (changed) {
      this.notify.updateState(false, {}, {})
    }
  }

  select(selectionRectangle, currentState, props) {
    const {
      selectedNodes: nodes,
      selectedValues: values
    } = currentState
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
      if (!domnode || !mouseMath.objectsCollide(selectionRectangle, bounds, this.clickTolerance, key)) {
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
    if (props.selectIntermediates) {
      const min = Math.min(...selectedIndices)
      const max = Math.max(...selectedIndices)
      const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
      filled.unshift(min)
      const diff = filled.filter(val => selectedIndices.indexOf(val) === -1)
      diff.forEach(idx => saveNode(this.sortedNodes[idx], mouseMath.getBoundsForNode(findDOMNode(this.sortedNodes[idx].component))))
    }
    if (changedNodes.length) {
      changedNodes.forEach((item) => {
        item[1].callback(item[0], nodes, values)
      })
      this.selectedNodes = nodes
      this.selectedValues = values
      this.notify.updateState(null, nodes, values)
    }
  }

  registerSelectable(component, key, value, callback) {
    if (!this.selectables.hasOwnProperty(key)) {
      this.selectableKeys.push(key)
      this.sortedNodes.push({ component, key, value, callback } )
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.registration) {
      Debug.log(`registered: ${key}`, value)
    }
    this.selectables[key] = { component, value, callback }
  }

  unregisterSelectable(component, key) {
    delete this.selectables[key]
    this.selectableKeys = this.selectableKeys.filter((itemKey) => itemKey !== key)
    if (this.selectedNodes[key]) {
      const nodes = this.selectedNodes
      const values = this.selectedValues
      delete nodes[key]
      delete values[key]
      this.notify.updateState(null, nodes, values)
    }
  }
}
