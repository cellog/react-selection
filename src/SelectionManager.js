import { findDOMNode } from 'react-dom'

import mouseMath from './mouseMath.js'
import Debug from './debug.js'

export default class SelectionManager {
  constructor(selectionComponent, clickTolerance = 2) {
    this.selectionComponent = selectionComponent
    this.clickTolerance = clickTolerance
    this.selectables = {}
    this.selectableKeys = []
    this.sortedNodes = []
    this.selectedNodes = {}
    this.selectedValues = {}

    this.registerSelectable = this.registerSelectable.bind(this)
    this.unregisterSelectable = this.unregisterSelectable.bind(this)
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
      this.selectionComponent.updateState(null, nodes, values)
    }
  }

  deselectNodes(selectedNodes) {
    this.selectedNodes = selectedNodes
    let changed = false
    Object.keys(selectedNodes).forEach((key) => {
      changed = true
      this.selectables[key].callback(false, {}, {})
    })
    if (changed) {
      this.selectionComponent.updateState(false, {}, {})
    }
  }

  setSelectionRectangle(rect) {
    this._selectRect = rect
  }

  setClickTolerance(tolerance = 5) {
    this.clickTolerance = tolerance
  }

  selectNodes({ selectedNodes, selectedValues, selectIntermediates }, findNode = findDOMNode) {
    this.selectedNodes = selectedNodes
    const nodes = {...selectedNodes}
    const values = {...selectedValues}
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
      const domnode = findNode(node.component)
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
    if (selectIntermediates) {
      const min = Math.min(...selectedIndices)
      const max = Math.max(...selectedIndices)
      const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
      filled.unshift(min)
      const diff = filled.filter(val => selectedIndices.indexOf(val) === -1)
      diff.forEach(idx => saveNode(this.sortedNodes[idx], mouseMath.getBoundsForNode(findNode(this.sortedNodes[idx].component))))
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
      this.selectionComponent.updateState(null, nodes, values)
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      Debug.log('end of selectNodes')
    }
  }
}
