import mouseMath from './mouseMath.js'
import Debug from './debug.js'
import SelectionManager from './SelectionManager.js'

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
      this.selectionManager = new SelectionManager(this, 2)
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
        registerSelectable: this.selectionManager.registerSelectable,
        unregisterSelectable: this.selectionManager.unregisterSelectable,
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
        this.selectionManager.setSelectionRectangle(mouseMath.createSelectRect(coords, this.mouseDownData))
        this.selectionManager.selectNodes({
          selectedNodes: this.state.selectedNodes,
          selectedValues: this.state.selectedValues,
          selectIntermediates: this.props.selectIntermediates
        })
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
      this.selectionManager.setSelectionRectangle(mouseMath.createSelectRect(e, this.mouseDownData))
      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.selectionManager.deselectNodes(this.state.selectedNodes)
        return
      }
      this.selectionManager.selectNodes({
        selectedNodes: this.state.selectedNodes,
        selectedValues: this.state.selectedValues,
        selectIntermediates: this.props.selectIntermediates
      })
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
      this.selectionManager.deselectNodes(this.state.selectedNodes)
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
        this.selectionManager.deselectNodes(this.state.selectedNodes)
        return
      }
      this.selectionManager.selectNodes({
        selectedNodes: this.state.selectedNodes,
        selectedValues: this.state.selectedValues,
        selectIntermediates: this.props.selectIntermediates
      })
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
        this.selectionManager.setSelectionRectangle(mouseMath.createSelectRect(coords, this.mouseDownData))
      }
      if (this.props.constantSelect) {
        this.selectionManager.selectNodes({
          selectedNodes: this.state.selectedNodes,
          selectedValues: this.state.selectedValues,
          selectIntermediates: this.props.selectIntermediates
        })
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
