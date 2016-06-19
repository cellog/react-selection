import Debug from './debug.js'
import InputManager from './InputManager.js'
import SelectionManager from './SelectionManager.js'
import verifyComponent from './verifyComponent.js'
import makeReferenceableContainer from './ReferenceableContainer.jsx'

import React, { PropTypes } from 'react'

function makeSelectable( Component, options = {}) {
  const { sorter = false, nodevalue = (node) => node.props.value } = options
  // always force a ReferenceableContainer if a stateless functional component is passed in
  const useContainer = verifyComponent(Component)
  const componentDisplayName = Component.displayName || Component.name || 'Component'
  let displayName
  let ReferenceableContainer
  if (useContainer) {
    displayName = `Selection(ReferenceableContainer(${componentDisplayName}))`
    ReferenceableContainer = makeReferenceableContainer(Component, componentDisplayName)
  } else {
    displayName = `Selection(${componentDisplayName})`
  }

  return class extends React.Component {
    static displayName = displayName
    constructor(props) {
      super(props)
      this.state = {
        selecting: false,
        selectedNodes: {},
        selectedNodeList: [],
        selectedValues: {},
        selectedValueList: []
      }
      this.selectionManager = new SelectionManager(this, props)
      this.makeInputManager = this.makeInputManager.bind(this)
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
      selectionManager: PropTypes.object,
      selectedNodes: PropTypes.object,
      selectedNodeList: PropTypes.array,
      selectedValues: PropTypes.object,
      selectedValueList: PropTypes.array
    }

    updateState(selecting, nodes, values, nodearray, valuearray) {
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log('updatestate: ', selecting, nodes, values)
      }
      const newnodes = nodes === null ? this.state.selectedNodes : nodes
      const newvalues = values === null ? this.state.selectedValues : values
      let nodelist
      if (nodearray === null) {
        nodelist = this.state.selectedNodeList
      } else {
        nodelist = sorter ? Object.keys(newnodes).map((key) => newnodes[key]).sort((a, b) => nodevalue(a.node) - nodevalue(b.node))
          : nodearray
      }
      let valuelist
      if (valuearray === null) {
        valuelist = this.state.selectedValueList
      } else {
        valuelist = sorter ? Object.keys(newvalues).map((key) => newvalues[key]).sort(sorter)
          : valuearray
      }
      this.setState({
        selecting: selecting === null ? this.state.selecting : selecting,
        selectedNodes: newnodes,
        selectedNodeList: nodelist,
        selectedValues: newvalues,
        selectedValueList: valuelist,
        containerBounds: this.bounds
      })
      if (this.props.onSelectSlot && this.props.constantSelect) {
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
      const nodelist = this.state.selectedNodeList
      const valuelist = this.state.selectedValueList
      if (Debug.DEBUGGING.debug && Debug.DEBUGGING.selection) {
        Debug.log('finishselect', newvalues, newnodes, valuelist, nodelist, this.bounds)
      }
      this.props.onFinishSelect(newvalues, () => newnodes, valuelist, () => nodelist, this.bounds)
    }

    getChildContext() {
      return {
        selectionManager: this.selectionManager,
        selectedNodes: this.state.selectedNodes,
        selectedValues: this.state.selectedValues,
        selectedNodeList: this.state.selectedNodeList,
        selectedValueList: this.state.selectedValueList
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
      if (this.props.constantSelect) {
        this.selectionManager.select(selectionRectangle, this.state, this.props)
      } else {
        this.selectionManager.deselect(this.state)
      }
    }

    cancel() {
      this.selectionManager.deselect(this.state)
      this.propagateFinishedSelect()
      this.setState({ selecting: false })
    }

    end(e, mouseDownData, selectionRectangle) {
      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.propagateFinishedSelect()
        this.selectionManager.deselect(this.state)
        return
      }
      this.selectionManager.select(selectionRectangle, this.state, this.props)
      this.propagateFinishedSelect()
    }

    change(selectionRectangle) {
      const old = this.state.selecting

      if (!old) {
        this.setState({selecting: true})
      }

      if (this.props.constantSelect) {
        this.selectionManager.select(selectionRectangle, this.state, this.props)
      }
    }

    makeInputManager(ref, inputManager = InputManager) {
      if (!ref) return
      if (this.ref === ref) return
      if (this.inputManager) this.inputManager.unmount()
      this.ref = ref
      this.inputManager = new inputManager(ref, this, this)
    }

    render() {
      if (useContainer) {
        return (
          <ReferenceableContainer
            {...this.props}
            {...this.state}
            ref={this.makeInputManager}
          />
        )
      }
      return (
        <Component
          {...this.props}
          {...this.state}
          ref={this.makeInputManager}
        />
      )
    }
  }
}

export default makeSelectable
