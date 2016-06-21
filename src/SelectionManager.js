import { findDOMNode } from 'react-dom'

import mouseMath from './mouseMath.js'
import Debug from './debug.js'

export default class SelectionManager {
  constructor(notify, list, props) {
    this.selectedList = list
    this.clickTolerance = props.clickTolerance
    this.selecting = false
    this.selectables = {}
    this.selectableKeys = []
    this.sortedNodes = []
    this.selectedNodes = {}
    this.selectedValues = {}
    this.selectedNodeList = []
    this.selectedValueList = []
    this.firstNode = null
    this.indexMap = {}
    this.notify = notify
  }

  changeType(key, types) {
    this.selectables[key].types = types
    this.sortedNodes[this.indexMap[key]].types = types
  }

  changeSelectable(key, selectable) {
    this.selectables[key].selectable = selectable
    this.sortedNodes[this.indexMap[key]].selectable = selectable
  }

  registerSelectable(component, { key, value, types, selectable, callback, cacheBounds },
                     mouse = mouseMath, findit = findDOMNode) {
    const bounds = cacheBounds ? mouse.getBoundsForNode(findit(component)) : null
    const info = { component, key, value, types, callback, bounds }
    if (this.selectables.hasOwnProperty(key)) {
      // this allows us to dynamically update a component if it changes
      // its type, or its value
      this.sortedNodes[this.indexMap[key]] = info
    } else {
      this.selectableKeys.push(key)
      this.indexMap[key] = this.sortedNodes.length
      this.sortedNodes.push(info)
    }
    if (Debug.DEBUGGING.debug && Debug.DEBUGGING.registration) {
      Debug.log(`registered: ${key}`, value)
    }
    this.selectables[key] = info
    this.selectedList.setNodes(this.sortedNodes)
  }

  unregisterSelectable(component, key) {
    delete this.selectables[key]
    this.selectableKeys = this.selectableKeys.filter((itemKey) => itemKey !== key)
    this.sortedNodes = this.sortedNodes.filter((item) => item.key !== key)
    if (this.selectedNodes[key]) {
      const nodes = this.selectedNodes
      const values = this.selectedValues
      const nodeindex = this.selectedNodeList.indexOf(nodes[key])
      const nodelist = this.selectedNodeList.splice(nodeindex, 1)
      const valuelist = this.selectedValueList.splice(nodeindex, 1)
      delete nodes[key]
      delete values[key]
      this.notify.updateState(null, nodes, values, nodelist, valuelist)
    }
    this.selectedList.setNodes(this.sortedNodes)
  }

  select({ selectionRectangle, props }, findit = findDOMNode, mouse = mouseMath) {
    if (!this.selectedList.selectItemsInRectangle(selectionRectangle, props, findit, mouse)) {
      return
    }
    this.notify.updateState(null,
      this.selectedList.selectedNodes(),
      this.selectedList.selectedValues(),
      this.selectedList.selectedNodeList(),
      this.selectedList.selectedValueList()
    )
  }

  deselect() {
    if (!this.selectedList.clear()) return
    this.notify.updateState(false, {}, {}, [], [])
  }

  begin(props) {
    this.selectedList.begin(props.selectionOptions.additive ?
      this.selectedList.selectedIndices : [], props)
  }

  commit() {
    this.selectedList.commit()
  }

  isSelecting() {
    return this.selecting
  }
}
