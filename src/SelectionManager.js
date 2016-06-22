import { findDOMNode } from 'react-dom'

import mouseMath from './mouseMath.js'
import Debug from './debug.js'

export default class SelectionManager {
  constructor(notify, list, props) {
    this.selectedList = list
    this.clickTolerance = props.clickTolerance
    this.selecting = false
    this.selectables = {}
    this.sortedNodes = []
    this.indexMap = {}
    this.notify = notify
  }

  changeType(key, types) {
    this.selectables[key].types = types
    this.sortedNodes[this.indexMap[key]].types = types
    this.selectedList.setNodes(this.sortedNodes)
  }

  changeSelectable(key, selectable) {
    this.selectables[key].selectable = selectable
    this.sortedNodes[this.indexMap[key]].selectable = selectable
    this.selectedList.setNodes(this.sortedNodes)
  }

  registerSelectable(component, { key, value, types, selectable, callback, cacheBounds },
                     mouse = mouseMath, findit = findDOMNode) {
    if (key === undefined) {
      throw new Error(`component registered with undefined key, value is ${JSON.stringify(value)}`)
    }
    const bounds = cacheBounds ? mouse.getBoundsForNode(findit(component)) : null
    const info = { component, key, value, types, callback, bounds }
    if (this.selectables.hasOwnProperty(key)) {
      // this allows us to dynamically update a component if it changes
      // its type, or its value
      this.sortedNodes[this.indexMap[key]] = info
    } else {
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
    const index = this.indexMap[key]
    this.sortedNodes = this.sortedNodes.filter((item) => item.key !== key)
    this.selectedList.setNodes(this.sortedNodes)
    if (this.selectedList.selectedIndices.indexOf(index) !== -1) {
      this.selectedList.selectedIndices.splice(index, 1)
      this.notify.updateState(null)
    }
  }

  select({ selectionRectangle, props }, findit = findDOMNode, mouse = mouseMath) {
    return this.selectedList.selectItemsInRectangle(selectionRectangle, props, findit, mouse)
  }

  cancelSelection({ indices = undefined, nodes = undefined, values = undefined }) {
    if (indices) {
      return this.selectedList.cancelIndices(indices)
    }
    if (nodes) {
      return this.selectedList.removeNodes(nodes)
    }
    if (values) {
      return this.selectedList.removeValues(values)
    }
  }

  deselect() {
    if (!this.selectedList.clear()) return
  }

  begin(props) {
    this.selectedList.begin(props.selectionOptions.additive ?
      this.selectedList.selectedIndices : [], props)
    this.selecting = true
  }

  commit() {
    this.selectedList.commit()
    this.selecting = false
  }

  isSelecting() {
    return this.selecting
  }
}
