import 'should'
import $ from 'teaspoon'
import { Selection, Selectable } from '../src/index.js'
import React, { Component } from 'react'

describe("Selection", () => {
  const Blah = class A extends Component {
    render() {
      return (
        <div>
          hi {this.props.name}<br />
          {this.props.children}
        </div>
      )
    }
  }
  it("should have tests, and will soon", function() {
  });
});
