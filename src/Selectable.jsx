import React, { PropTypes } from 'react'

import verifyComponent from './verifyComponent.js'

function Selectable(Component, options) {
  verifyComponent(Component)
  const displayName = Component.displayName || Component.name || 'Component'
  let unregister = () => null
  return class extends React.Component {
    static displayName = `Selectable(${displayName})`

    constructor(props, context) {
      super(props, context)
      this.state = {
        selected: false
      }
      this.selectItem = this.selectItem.bind(this)
    }

    static contextTypes = {
      selectionManager: PropTypes.object
    }

    componentDidMount() {
      if (!this.context || !this.context.selectionManager) return
      const key = options.key(this.props)
      this.context.selectionManager.registerSelectable(this,
        key,
        options.value(this.props),
        this.selectItem,
        options.cacheBounds)
      unregister = this.context.selectionManager.unregisterSelectable.bind(this.context.selectionManager, this, key)
    }

    componentWillUnmount() {
      unregister()
      unregister = () => null
    }

    selectItem(value) {
      this.setState({ selected: value })
    }

    render() {
      return <Component {...this.props} selected={this.state.selected} />
    }
  }
}

export default Selectable
