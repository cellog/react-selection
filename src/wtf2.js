// import { findDOMNode } from 'react-dom'

// import mouseMath from './mouseMath.js'
// import Debug from './debug.js'

export default class selectList {
  // nodes = []
  // bounds = []
  // indices = {}
  // selectedIndices = []
  // removed = []
  // added = []
  // transaction = {
  // }
  //
  // constructor() {
  //   const _this = this
  //   this.accessor = {
  //     nodes() {
  //     },
  //
  //     node(idx) {
  //       return _this.nodes[idx]
  //     },
  //
  //     nodeIndicesOfType(types) {
  //       const mytypes = [].concat(types)
  //       return _this.nodes.filter(node => mytypes.every(type => node.types.indexOf(type) !== -1)).map(node => _this.nodes.indexOf(node))
  //     },
  //
  //     selectedIndices() {
  //       return [..._this.selectedIndices]
  //     },
  //
  //     selectedNodeList() {
  //       return _this.selectedIndices.map(idx => this.nodes[idx].component)
  //     },
  //
  //     selectedValueList() {
  //       return _this.selectedIndices.map(idx => this.nodes[idx].value)
  //     },
  //
  //     selectedNodes() {
  //       return _this.selectedIndices.reduce((val, idx) => {
  //         val[this.nodes[idx].key] = {
  //           node: this.nodes[idx].component,
  //           bounds: this.bounds[idx]
  //         }
  //         return val
  //       }, {})
  //     },
  //
  //     selectedValues() {
  //       return _this.selectedIndices.reduce((val, idx) => {
  //         val[this.nodes[idx].key] = this.nodes[idx].value
  //         return val
  //       }, {})
  //     }
  //   }
  // }
  //
  // setNodes(nodes) {
  //   this.nodes = nodes
  //   this.nodes.forEach((node, idx) => this.indices[node.key] = idx)
  // }
  //
  // begin(selectedIndices, props) {
  //   this.transaction = {
  //     previousSelection: [...selectedIndices],
  //     mostRecentSelection: [...selectedIndices],
  //     additionalSelectionMap: {},
  //     firstNode: false
  //   }
  //
  //   this.selectedIndices = []
  //   this.removed = []
  //   this.added = []
  //   this.props = props
  // }
  //
  // commit() {
  //   this.transaction = {}
  // }
  //
  // addItem(idx, selectedIndices = this.selectedIndices) {
  //   if (!this.transaction.firstNode) {
  //     this.transaction.firstNode = this.nodes[idx]
  //   }
  //   const si = selectedIndices
  //   // determine how to insert the value prior to insertion sort
  //   if (!si.length || idx > si[si.len - 1]) {
  //     si.push(idx)
  //     return
  //   }
  //   if (idx < si[0]) {
  //     si.unshift(idx)
  //     return
  //   }
  //   const len = si.length
  //   // if the index is closer to one end than the other, start there
  //   if (si[len - 1] - idx <= idx - si[0]) {
  //     si.push(idx)
  //     let curIdx = len
  //     // insertion sort from end
  //     while (curIdx >= 1 && si[curIdx - 1] > idx) {
  //       si[curIdx] = si[curIdx - 1]
  //       si[--curIdx] = idx
  //     }
  //   } else {
  //     si.unshift(idx)
  //     let curIdx = 0
  //     // insertion sort from start
  //     while (curIdx <= len && si[curIdx + 1] < idx) {
  //       si[curIdx] = si[curIdx + 1]
  //       si[++curIdx] = idx
  //     }
  //   }
  // }
  //
  // removeItem(idx) {
  //   const index = this.selectedIndices.indexOf(idx)
  //   if (index === -1) return
  //   this.selectedIndices.splice(index, 1)
  // }
  //
  // selectItem(idx) {
  //   // first check to see if this index is the same type as the first node selected
  //   const node = this.nodes[idx]
  //   if (!node.selectable) return
  //   if (this.props.hasOwnProperty('acceptedTypes')) {
  //     // by default we accept all types, this prop restricts types accepted
  //     if (!this.props.acceptedTypes.reduce((last, type) => last || node.types.indexOf(type) !== -1, false)) {
  //       return
  //     }
  //   }
  //   if (this.transaction.firstNode) {
  //     // does this node share any types in common with the first selected node?
  //     if (!this.transaction.firstNode.types.reduce((last, type) => last || node.types.indexOf(type) !== -1, false)) {
  //       // no
  //       return
  //     }
  //   }
  //   if (this.selectedIndices.indexOf(idx) !== -1) return
  //   if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
  //     Debug.log('select new node', this.nodes[idx].key)
  //   }
  //   this.addItem(idx)
  // }
  //
  // deselectItem(idx) {
  //   if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
  //     Debug.log('deselect node', this.nodes[idx].key)
  //   }
  //   this.removeItem(idx)
  // }
  //
  // testNodes({ selectionRectangle, props, findit, mouse }, node, idx) {
  //   let bounds
  //   if (node.bounds) {
  //     bounds = node.bounds
  //   } else {
  //     const domnode = findit(node.component)
  //     bounds = domnode ? mouse.getBoundsForNode(domnode) : false
  //   }
  //   this.bounds[idx] = bounds
  //
  //   if (bounds && mouse.objectsCollide(selectionRectangle, bounds, this.clickTolerance, node.key)) {
  //     // node is in the selection rectangle
  //     if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
  //       Debug.log('node is in selection rectangle', node.key)
  //     }
  //     this.selectItem(idx)
  //   } else {
  //     // node is not in the selection rectangle
  //     if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
  //       Debug.log('node is not in selection rectangle', node.key)
  //     }
  //     this.deselectItem(idx)
  //   }
  // }
  //
  // changed(newSelected, prevSelected) {
  //   return prevSelected.filter(idx => newSelected.indexOf(idx) === -1)
  // }
  //
  // xor(newSelected, prevSelected) {
  //   const ret = [...prevSelected]
  //   newSelected.forEach(idx => prevSelected.indexOf(idx) === -1 ? this.addItem(idx, ret) : ret.splice(ret.indexOf(idx), 1))
  //   return ret
  // }
  //
  // or(newSelected, prevSelected) {
  //   const ret = [...prevSelected]
  //   newSelected.forEach(idx => prevSelected.indexOf(idx) === -1 ? this.addItem(idx, ret) : null)
  //   return ret
  // }
  //
  // selectItemsInRectangle(selectionRectangle, props, findit = findDOMNode, mouse = mouseMath) {
  //   if (!this.transaction.previousSelection) {
  //     // fail-safe
  //     this.begin([])
  //   }
  //   this.selectedIndices = []
  //   this.props = props
  //   this.removed = []
  //   this.added = []
  //
  //   // get a list of all nodes that are potential selects from the selection rectangle
  //   this.nodes.forEach(this.testNodes.bind(this, {selectionRectangle, props, findit, mouse}))
  //
  //   // add the nodes that are logically selected in-between
  //   const options = props.selectionOptions
  //   if (options.inBetween && this.selectedIndices.length) {
  //     const min = Math.min(...this.selectedIndices)
  //     const max = Math.max(...this.selectedIndices)
  //     const filled = Array.apply(min, Array(max - min)).map((x, y) => min + y + 1)
  //     filled.unshift(min)
  //     if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
  //       Debug.log('gaps to fill', filled)
  //     }
  //     filled.forEach((idx) => this.selectItem(idx))
  //   }
  //
  //   // for additive, we will use xor
  //   if (options.additive) {
  //     this.selectedIndices = this.xor(this.selectedIndices, this.transaction.previousSelection)
  //   } else {
  //     this.selectedIndices = this.or(this.selectedIndices, this.transaction.previousSelection)
  //   }
  //
  //   const test = this.transaction.additionalSelectionMap[this.keyize(this.selectedIndices)]
  //   if (test) {
  //     this.selectedIndices = test
  //   }
  //   if (this.selectedIndices.length === this.transaction.mostRecentSelection.length) {
  //     if (this.selectedIndices.every((idx, i) => this.transaction.mostRecentSelection[i] === idx)) return false
  //   }
  //   this.removed = this.changed(this.selectedIndices, this.transaction.mostRecentSelection)
  //   this.added = this.changed(this.transaction.mostRecentSelection, this.selectedIndices)
  //   this.transaction.previousMostRecentSelection = [...this.transaction.mostRecentSelection]
  //   this.transaction.mostRecentSelection = [...this.selectedIndices]
  //   return true
  // }
  //
  // notifyChangedNodes() {
  //   this.removed.map(idx => this.nodes[idx].callback ? this.nodes[idx].callback(false) : null)
  //   this.added.map(idx => this.nodes[idx].callback ? this.nodes[idx].callback(true) : null)
  // }
  //
  // clear() {
  //   this.added = []
  //   this.removed = []
  //   if (this.selectedIndices.length === 0) return false
  //   this.selectedIndices.forEach(idx => this.nodes[idx].callback && this.nodes[idx].callback(false))
  //   this.selectedIndices = []
  //   return true
  // }
  //
  // revert() {
  //   const add = this.removed
  //   const remove = this.added
  //
  //   add.forEach(idx => this.addItem(idx, this.selectedIndices))
  //   remove.forEach(idx => this.removeItem(idx, this.selectedIndices))
  // }
  //
  // keyize(indices) {
  //   return indices.toString()
  // }
  //
  // setSelection(indices) {
  //   this.transaction.additionalSelectionMap[this.keyize(this.selectedIndices)] = indices
  //   this.selectedIndices = indices
  //   this.removed = this.changed(this.selectedIndices, this.transaction.previousMostRecentSelection)
  //   this.added = this.changed(this.transaction.previousMostRecentSelection, this.selectedIndices)
  //   this.mostRecentSelection = indices
  // }
}
