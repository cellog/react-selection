/* eslint react/no-multi-comp:0 */
import React, { PropTypes } from 'react'

import makeReferenceableContainer from './ReferenceableContainer.jsx'
import verifyComponent from './verifyComponent.js'

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
        selectable: true
      }
      this.selectItem = this.selectItem.bind(this)
      this.changeSelectable = this.changeSelectable.bind(this)
    }

    static contextTypes = {
      selectionManager: PropTypes.object
    }

    componentDidMount() {
      if (!this.context || !this.context.selectionManager) return
      const key = options.key(this.props)
      this.context.selectionManager.registerSelectable(this, {
        key: key,
        types: options.types ? new options.types : ['default'],
        value: options.value(this.props),
        callback: this.selectItem,
        cacheBounds: options.cacheBounds
      })
      unregister = this.context.selectionManager.unregisterSelectable.bind(this.context.selectionManager, this, key)
    }

    componentWillUnmount() {
      unregister()
      unregister = () => null
    }

    selectItem(value) {
      this.setState({ selected: value })
    }

    changeSelectable(selectable) {
      this.context.selectionManager.changeSelectable(options.key(this.props), selectable)
      this.setState({ selectable })
    }

    render() {
      if (useContainer) {
        return <ReferenceableContainer {...this.props} selected={this.state.selected} changeSelectable={this.changeSelectable} />
      }
      return <Component {...this.props} selected={this.state.selected} changeSelectable={this.changeSelectable} />
    }
  }
}

export default Selectable
