import mouseMath from './mouseMath.js'
import Debug from './debug.js'

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
      this.touchStart = this.touchStart.bind(this)
      this.touchEnd = this.touchEnd.bind(this)
      this.touchMove = this.touchMove.bind(this)
      this.touchCancel = this.touchCancel.bind(this)

      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.click = this.click.bind(this)
      this.mouseDownData = null
      this.clickTolerance = 2
      this.handlers = {
        stopmouseup: () => null,
        stopmousemove: () => null,
        stoptouchend: () => null,
        stoptouchmove: () => null,
        stoptouchcancel: () => null
      }
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
      onTouchStart: PropTypes.func,
      onClick: PropTypes.func
    }

    static defaultProps = {
      clickTolerance: 5,
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

    addListener(node, type, handler) {
      node.addEventListener(type, handler)
      this.handlers[`stop${type}`] = () => {
        node.removeEventListener(type, handler)
        this.handlers[`stop${type}`] = () => null
      }
    }

    componentWillUnmount() {
      if (this.handlers.stopmousedown) {
        this.handlers.stopmousedown()
      }
      if (this.handlers.stopmouseup) {
        this.handlers.stopmouseup()
      }
      if (this.handlers.stopmousemove) {
        this.handlers.stopmousemove()
      }
      if (this.handlers.stoptouchend) {
        this.handlers.stoptouchend()
      }
      if (this.handlers.stoptouchmove) {
        this.handlers.stoptouchmove()
      }
      if (this.handlers.stoptouchcancel) {
        this.handlers.stoptouchcancel()
      }
    }

    touchStart(e) {
      this.startSelectHandler(e, this.props.onTouchStart, 'touchstart', () => {
        this.addListener(document, 'touchend', this.touchEnd)
        this.addListener(document, 'touchmove', this.touchMove)
      })
    }

    mouseDown(e) {
      this.startSelectHandler(e, this.props.onMouseDown, 'mousedown', () => {
        this.addListener(document, 'mouseup', this.mouseUp)
        this.addListener(document, 'mousemove', this.mouseMove)
      })
    }

    startSelectHandler(e, priorHandler, eventname, newEvents) {
      const invalid = e.touches && e.touches.length > 1
      if (!this.props.selectable || invalid) {
        if (priorHandler) {
          priorHandler(e)
        }
        return
      }
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
        Debug.log(eventname)
      }
      if (!this.props.selectable) return
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
        Debug.log(`${eventname}: selectable`)
      }
      if (!this.node) {
        this.node = findDOMNode(this.ref)
        this.bounds = mouseMath.getBoundsForNode(this.node)
        if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
          Debug.log(`${eventname}: got bounds`, this.bounds)
        }
      }
      const coords = mouseMath.getCoordinates(e, e.touches && e.touches[0].identifier)
      if (e.which === 3 || e.button === 2 || !mouseMath.contains(this.node, coords.clientX, coords.clientY)) {
        if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
          Debug.log(`${eventname}: buttons or not contained`)
        }
        return
      }
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
        Debug.log(`${eventname}: left click`)
      }
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
        Debug.log(`${eventname}: bounds`, this.bounds, e.pageY, e.pageX)
      }
      if (!mouseMath.objectsCollide(this.bounds, {
        top: coords.pageY,
        left: coords.pageX
      })) return
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.clicks) {
        Debug.log(`${eventname}: maybe select`)
      }

      this.mouseDownData = {
        x: coords.pageX,
        y: coords.pageY,
        clientX: coords.clientX,
        clientY: coords.clientY,
        touchID: e.touches ? e.touches[0].identifier : false 
      }

      if (this.props.constantSelect) {
        this._selectRect = mouseMath.createSelectRect(coords, this.mouseDownData)
        this.selectNodes(e)
      }

      e.preventDefault()

      newEvents()
    }

    click(e) {
      if (!this.props.selectable) {
        if (this.props.onClick) {
          this.props.onClick(e)
        }
        return
      }
      if (!this.mouseDownData) return
      this.handlers.stopmouseup()
      this.handlers.stopmousemove()
      this._selectRect = mouseMath.createSelectRect(e, this.mouseDownData)
      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.deselectNodes()
        return
      }
      this.selectNodes()
    }

    touchEnd(e) {
      this.handlers.stoptouchmove()
      this.handlers.stoptouchend()

      if (!this.mouseDownData) return
      this.endSelect(e)
    }

    touchCancel() {
      this.handlers.stoptouchmove()
      this.handlers.stoptouchend()
      this.deselectNodes()
      this.propagateFinishedSelect()
      this.setState({ selecting: false })
    }

    mouseUp(e) {
      this.handlers.stopmouseup()
      this.handlers.stopmousemove()

      if (!this.mouseDownData) return
      this.endSelect(e)
    }

    endSelect(e) {
      if (mouseMath.isClick(e, this.mouseDownData, this.clickTolerance)) {
        if (this.state.selecting) {
          this.setState({ selecting: false })
        }
        return
      }

      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.propagateFinishedSelect()
        this.deselectNodes()
        return
      }
      this.selectNodes()
    }

    touchMove(e) {
      if (!this.mouseDownData) return
      this.expandSelect(e)
    }

    mouseMove(e) {
      if (!this.mouseDownData) return
      this.expandSelect(e)
    }

    expandSelect(e) {
      const old = this.state.selecting

      if (!old) {
        this.setState({selecting: true})
      }

      const coords = mouseMath.getCoordinates(e, this.mouseDownData.touchID)
      if (!mouseMath.isClick(coords, this.mouseDownData, this.clickTolerance)) {
        this._selectRect = mouseMath.createSelectRect(coords, this.mouseDownData)
      }
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
          if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
            Debug.log(`reached start of unselected item`)
          }
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
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.bounds) {
        Debug.log(`reached end of selection loop`)
      }
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
          item[1].callback(item[0], nodes, values)
        })
        this.updateState(null, nodes, values)
      }
    }

    render() {
      if (this.containerDiv) {
        return (
          <div
            onMouseDown={this.mouseDown}
            onClick={this.click}
            onTouchStart={this.touchStart}
            onTouchMove={this.touchMove}
            onTouchEnd={this.touchEnd}
            onTouchCancel={this.touchCancel}
          >
            <Component
              {...this.props}
              {...this.state}
              ref={(ref) => { this.ref = ref }}
            />
          </div>
        )
      }
      return (
        <Component
          {...this.props}
          {...this.state}
          onMouseDown={this.mouseDown}
          onClick={this.click}
          onTouchStart={this.touchStart}
          onTouchMove={this.touchMove}
          onTouchEnd={this.touchEnd}
          onTouchCancel={this.touchCancel}
          ref={(ref) => { this.ref = ref }}
        />
      )
    }
  }
}

export default makeSelectable
