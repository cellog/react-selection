/* eslint react/no-multi-comp:0 */
import React, { PropTypes } from 'react'

import makeReferenceableContainer from './ReferenceableContainer.jsx'
import verifyComponent from './verifyComponent.js'
import shallowEqual from './shallowEqual.js'
import shallowEqualScalar from './shallowEqualScalar.js'

function Selectable(Component, options) {
  const useContainer = verifyComponent(Component)
  const componentDisplayName = Component.displayName || Component.name || 'Component'
  let displayName
  let ReferenceableContainer
  if (useContainer) {
    displayName = `Selectable(ReferenceableContainer(${componentDisplayName}))`
    ReferenceableContainer = makeReferenceableContainer(Component, componentDisplayName)
  } else {
    displayName = `Selectable(${componentDisplayName})`
  }
  let unregister = () => null
  return class extends React.Component {
    static displayName = displayName

    constructor(props, context) {
      super(props, context)
      this.state = {
        selected: false,
        selectable: options.selectable ? options.selectable(props) : true
      }
      this.selectItem = this.selectItem.bind(this)
      this.changeSelectable = this.changeSelectable.bind(this)
    }

    static contextTypes = {
      selectionManager: PropTypes.object
    }

    componentWillReceiveProps(props) {
      this.register(props)
      if (options.selectable) {
        this.setState({ selectable: options.selectable(props) })
      }
    }

    register(props) {
      let types = ['default']
      if (options.types) {
        if (options.types instanceof Function) {
          types = options.types(props)
        } else {
          types = options.types
        }
      }
      this.key = options.key(this.props)
      this.context.selectionManager.registerSelectable(this, {
        key: this.key,
        selectable: options.selectable ? options.selectable(props) : true,
        types: types,
        value: options.value(props),
        callback: this.selectItem,
        cacheBounds: options.cacheBounds
      })
    }

    componentDidMount() {
      if (!this.context || !this.context.selectionManager) return
      this.register(this.props)
      unregister = this.context.selectionManager.unregisterSelectable.bind(this.context.selectionManager, this, this.key)
    }

    componentWillUnmount() {
      unregister()
      unregister = () => null
    }

    selectItem(value) {
      if (value === this.state.selected) return
      this.setState({ selected: value })
      this.forceUpdate()
    }

    changeSelectable(selectable) {
      this.context.selectionManager.changeSelectable(options.key(this.props), selectable)
      this.setState({ selectable })
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !shallowEqualScalar(nextProps, this.props) ||
        !shallowEqual(nextState, this.state)
    }

    render() {
      if (useContainer) {
        return <ReferenceableContainer {...this.props} {...this.state} changeSelectable={this.changeSelectable} />
      }
      return <Component {...this.props} {...this.state} changeSelectable={this.changeSelectable} />
    }
  }
}

export default Selectable
