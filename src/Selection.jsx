import InputManager from './InputManager.js'
import SelectionManager from './SelectionManager.js'
import verifyComponent from './verifyComponent.js'
import selectedList from './selectedList.js'
import makeReferenceableContainer from './ReferenceableContainer.jsx'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'
import mouseMath from './mouseMath.js'

function makeSelectable(Component) {
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
        selectedIndices: []
      }
      this.selectedList = new selectedList
      this.selectionManager = new SelectionManager(this, this.selectedList, props)
      this.makeInputManager = this.makeInputManager.bind(this)
      this.cancelSelection = this.cancelSelection.bind(this)
    }

    static propTypes = {
      clickTolerance: PropTypes.number,
      selectionOptions: PropTypes.shape({
        constant: PropTypes.bool,
        additive: PropTypes.bool,
        selectable: PropTypes.bool,
        preserve: PropTypes.bool,
        inBetween: PropTypes.bool,
        acceptedTypes: PropTypes.array
      }),
      selectionCallbacks: PropTypes.shape({
        onSelectionChange: PropTypes.func,
        onFinishSelect: PropTypes.func,
        onSelectStart: PropTypes.func
      }),
      onMouseDown: PropTypes.func,
      onTouchStart: PropTypes.func,
    }

    static defaultProps = {
      clickTolerance: 2,
      selectionOptions: {
        constant: false,
        selectable: false,
        preserve: false,
        inBetween: false
      },
      selectionCallbacks: {
      }
    }

    static childContextTypes = {
      selectionManager: PropTypes.object,
      selectedIndices: PropTypes.array,
      nodeList: PropTypes.object
    }

    updateState(selecting) {
      const onSelectionChange = this.props.selectionCallbacks.onSelectionChange
      if (onSelectionChange &&
          this.props.selectionOptions.constant &&
          this.selectionManager.isSelecting()) {
        const result = onSelectionChange(this.selectedList.removed,
          this.selectedList.added, this.selectedList.accessor)
        if (result === false) {
          this.selectedList.revert()
        } else if (result && result !== true) {
          this.selectedList.setSelection(result)
        }
      }
      // we are ok to notify
      this.selectedList.notifyChangedNodes()

      this.setState({
        selecting: selecting === null ? this.state.selecting : selecting,
        selectedIndices: [...this.selectedList.selectedIndices],
        containerBounds: this.bounds
      })
      return true
    }

    cancelSelection(items) {
      this.selectionManager.cancelSelection(items)
    }

    propagateFinishedSelect() {
      if (!this.props.selectionCallbacks.onFinishSelect) return
      this.props.selectionCallbacks.onFinishSelect(this.state.selectedIndices,
        this.selectedList.accessor, this.bounds)
    }

    getChildContext() {
      return {
        selectionManager: this.selectionManager,
        selectedIndices: this.state.selectedIndices,
        nodeList: this.selectedList
      }
    }

    componentDidMount() {
      this.selectedList.setNodes(this.selectionManager.sortedNodes)
    }

    componentDidUpdate() {
      this.selectedList.setNodes(this.selectionManager.sortedNodes)
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
      if (!this.props.selectionOptions.additive) {
        this.selectionManager.deselect()
      }
      this.selectionManager.begin(this.props)
      if (this.props.selectionOptions.constant) {
        if (this.selectionManager.select({ selectionRectangle, props: this.props })) {
          this.updateState(null)
        }
      }
    }

    cancel() {
      this.selectionManager.commit()
      this.selectionManager.deselect()
      this.setState({ selecting: false })
    }

    end(e, mouseDownData, selectionRectangle) {
      if (this.props.selectionOptions.constant &&
           !(this.props.selectionOptions.preserve || this.props.selectionOptions.additive)) {
        this.propagateFinishedSelect()
        this.selectionManager.commit()
        this.selectionManager.deselect()
        this.updateState(false)
        this.setState({ selecting: false })
        return
      }
      this.selectionManager.select({ selectionRectangle, props: this.props })
      if (this.updateState(null)) {
        this.propagateFinishedSelect()
      }
      this.selectionManager.commit()
      this.setState({ selecting: false })
    }

    change(selectionRectangle, findit = findDOMNode, mouse = mouseMath) {
      const old = this.state.selecting

      if (!old) {
        this.setState({ selecting: true })
      }

      if (this.props.selectionOptions.constant) {
        if (this.selectionManager.select({ selectionRectangle, props: this.props }, findit, mouse)) {
          if (!this.updateState(null)) {
            this.cancel()
          }
        }
      }
    }

    click(e, mouseDownData, selectionRectangle) {
      this.end(e, mouseDownData, selectionRectangle)
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
