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
    this.selectedNodeList = []
    this.selectedValueList = []
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
      const nodelist = this.selectedNodeList.filter(node => node === nodes[key])
      const valuelist = this.selectedValueList.filter(value => value === values[key])
      delete nodes[key]
      delete values[key]
      this.notify.updateState(null, nodes, values, nodelist, valuelist)
    }
  }

  saveNode(changedNodes, node, bounds, selectionRectangle) {
    if (this.selectedNodes[node.key] !== undefined) return
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
      Debug.log(`select: ${node.key}`)
    }
    this.selectedNodes[node.key] = {node: node.component, bounds: bounds}
    this.selectedValues[node.key] = node.value
    if (selectionRectangle.y === selectionRectangle.top && selectionRectangle.x === selectionRectangle.left) {
      this.selectedNodeList.unshift(node.component)
      this.selectedValueList.unshift(node.component)
    } else {
      this.selectedNodeList.push(node.value)
      this.selectedValueList.push(node.value)
    }
    changedNodes.push([true, node])
  }

  walkNodes(selectionRectangle, selectedIndices, changedNodes, findit, mouse, node, idx) {
    const domnode = findit(node.component)
    const key = node.key
    const bounds = node.bounds ? node.bounds : mouse.getBoundsForNode(domnode)
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
      Debug.log(`node ${key} bounds`, bounds)
    }
    if (!domnode || !mouse.objectsCollide(selectionRectangle, bounds, this.clickTolerance, key)) {
      if (!this.selectedNodes.hasOwnProperty(key)) return
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log(`deselect: ${key}`)
      }
      delete this.selectedNodes[key]
      delete this.selectedValues[key]
      this.selectedNodeList = this.selectedNodeList.filter(n => n === node.component)
      this.selectedValueList = this.selectedValueList.filter(val => val === node.value)
      changedNodes.push([false, node])
      return
    }
    if (selectionRectangle.y === selectionRectangle.top && selectionRectangle.x === selectionRectangle.left) {
      selectedIndices.unshift(idx)
    } else {
      selectedIndices.push(idx)
    }
    this.saveNode(changedNodes, node, bounds, selectionRectangle)
  }

  select(selectionRectangle, currentState, props, findit = findDOMNode, mouse = mouseMath) {
    this.selectedNodes = currentState.selectedNodes
    this.selectedValues = currentState.selectedValues
    this.selectedNodeList = currentState.selectedNodeList
    this.selectedValueList = currentState.selectedValueList
    const changedNodes = []
    const selectedIndices = []

    this.sortedNodes.forEach(this.walkNodes.bind(this, selectionRectangle, selectedIndices, changedNodes, findit, mouse), this)

    if (props.selectIntermediates) {
      const min = Math.min(...selectedIndices)
      const max = Math.max(...selectedIndices)
      const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
      filled.unshift(min)
      const diff = filled.filter(val => selectedIndices.indexOf(val) === -1)
      diff.forEach(idx => this.saveNode(changedNodes, this.sortedNodes[idx],
        this.sortedNodes[idx].bounds ? this.sortedNodes[idx].bounds :
        mouse.getBoundsForNode(findit(this.sortedNodes[idx].component)),
        selectionRectangle))
    }
    if (changedNodes.length) {
      changedNodes.forEach((item) => {
        item[1].callback(item[0], this.selectedNodes, this.selectedValues)
      })
      this.notify.updateState(null,
        this.selectedNodes,
        this.selectedValues,
        this.selectedNodeList,
        this.selectedValueList
      )
    }
  }

  deselect(currentState) {
    let changed = false
    Object.keys(currentState.selectedNodes).forEach((key) => {
      changed = true
      this.selectables[key].callback(false, {}, {})
    })
    if (changed) {
      this.selectedNodes = {}
      this.selectedValues = {}
      this.selectedNodeList = []
      this.selectedValueList = []
      this.notify.updateState(false, {}, {}, [], [])
    }
  }
}
