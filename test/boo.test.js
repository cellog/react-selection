import 'should'
import $ from 'teaspoon'
import React, { Component, PropTypes } from 'react'

import Selection from '../src/wtf.jsx'

describe("Selection", () => {
  it("should work", () => {
    expect(true).to.be.true
    expect($).to.equal($)
    expect(React).to.equal(React)
    expect(Component).to.equal(Component)
    expect(PropTypes).to.equal(PropTypes)
    expect(Selection).to.equal(Selection)
  })
})
