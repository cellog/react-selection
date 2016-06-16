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

  registerSelectable(component, key, value, callback, cacheBounds, mouse = mouseMath, findit = findDOMNode) {
    const bounds = cacheBounds ? mouse.getBoundsForNode(findit(component)) : null
    if (!this.selectables.hasOwnProperty(key)) {
      this.selectableKeys.push(key)
      this.sortedNodes.push({ component, key, value, callback, bounds } )
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.registration) {
      Debug.log(`registered: ${key}`, value)
    }
    this.selectables[key] = { component, value, callback, bounds }
  }

  unregisterSelectable(component, key) {
    delete this.selectables[key]
    this.selectableKeys = this.selectableKeys.filter((itemKey) => itemKey !== key)
    this.sortedNodes = this.sortedNodes.filter((item) => item.key !== key)
    if (this.selectedNodes[key]) {
      const nodes = this.selectedNodes
      const values = this.selectedValues
      delete nodes[key]
      delete values[key]
      this.notify.updateState(null, nodes, values)
    }
  }

  saveNode(changedNodes, node, bounds) {
    if (this.selectedNodes[node.key] !== undefined) return
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
      Debug.log(`select: ${node.key}`)
    }
    this.selectedNodes[node.key] = {node: node.component, bounds: bounds}
    this.selectedValues[node.key] = node.value
    changedNodes.push([true, node])
  }

  sortNodes(selectionRectangle, selectedIndices, changedNodes, node, idx) {
    const domnode = findDOMNode(node.component)
    const key = node.key
    const bounds = node.bounds ? node.bounds : mouseMath.getBoundsForNode(domnode)
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      Debug.log(`node ${key} bounds`, bounds)
    }
    if (!domnode || !mouseMath.objectsCollide(selectionRectangle, bounds, this.clickTolerance, key)) {
      if (!this.selectedNodes.hasOwnProperty(key)) return
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log(`deselect: ${key}`)
      }
      delete this.selectedNodes[key]
      delete this.selectedValues[key]
      changedNodes.push([false, node])
      return
    }
    selectedIndices.push(idx)
    this.saveNode(changedNodes, node, bounds)
  }

  select(selectionRectangle, currentState, props) {
    this.selectedNodes = currentState.selectedNodes
    this.selectedValues = currentState.selectedValues
    const changedNodes = []
    const selectedIndices = []

    this.sortedNodes.forEach(this.sortNodes.bind(this, selectionRectangle, selectedIndices, changedNodes), this)
    if (props.selectIntermediates) {
      const min = Math.min(...selectedIndices)
      const max = Math.max(...selectedIndices)
      const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
      filled.unshift(min)
      const diff = filled.filter(val => this.selectedIndices.indexOf(val) === -1)
      diff.forEach(idx => this.saveNode(this.sortedNodes[idx],
        this.sortedNodes[idx].bounds ? this.sortedNodes[idx].bounds :
        mouseMath.getBoundsForNode(findDOMNode(this.sortedNodes[idx].component))))
    }
    if (changedNodes.length) {
      changedNodes.forEach((item) => {
        item[1].callback(item[0], this.selectedNodes, this.selectedValues)
      })
      this.notify.updateState(null, this.selectedNodes, this.selectedValues)
    }
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
}
