import React, { PropTypes } from 'react'

export default function makeReferenceableContainer(Component, componentDisplayName) {
  return class extends React.Component {
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
}
