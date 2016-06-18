/* eslint react/no-multi-comp:0 */
import React, { PropTypes } from 'react'

import verifyComponent from './verifyComponent.js'

function Selectable(Component, options) {
  const useContainer = verifyComponent(Component)
  const componentDisplayName = Component.displayName || Component.name || 'Component'
  let displayName
  let ReferenceableContainer
  if (useContainer) {
    displayName = `Selectable(ReferenceableContainer(${componentDisplayName}))`
    ReferenceableContainer = class extends React.Component {
      static displayName = `ReferenceableContainer(${componentDisplayName})`
      static propTypes = {
        children: PropTypes.element
      }
      render() {
        const {children, ...props} = this.props
        return (
          <Component {...props}>
            {children}
          </Component>
        )
      }
    }
  } else {
    displayName = `Selectable(${componentDisplayName})`
  }
  let unregister = () => null
  return class extends React.Component {
    static displayName = displayName

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
      if (useContainer) {
        return <ReferenceableContainer {...this.props} selected={this.state.selected} />
      }
      return <Component {...this.props} selected={this.state.selected} />
    }
  }
}

export default Selectable
