import 'should'
import mouseMath from '../src/mouseMath.js'

describe("mouseMath", () => {
  const e = {
    pageX: 50,
    pageY: 50
  }

  describe("isClick", () => {

    it("should accept a valid value", () => {
      mouseMath.isClick(e, { x: 50, y: 50 }, 5).should.be.true
    })

    it("should accept a valid value within tolerance", () => {
      mouseMath.isClick(e, { x: 55, y: 50 }, 5).should.be.true("x is 55")

      mouseMath.isClick(e, { x: 50, y: 55 }, 5).should.be.true("y is 55")
    })

    it("should fail outside tolerance", () => {
      mouseMath.isClick(e, { x: 56, y: 50 }, 5).should.be.false("x is 56")

      mouseMath.isClick(e, { x: 50, y: 44 }, 5).should.be.false("y is 44")
    })
  })

  describe("createSelectRect", () => {
    mouseMath.createSelectRect(e, { x: 55, y: 55 }).should.eql({
      bottom: 55,
      left: 50,
      right: 55,
      top: 50,
      x: 50,
      y: 50
    })

    mouseMath.createSelectRect(e, { x: 45, y: 45 }).should.eql({
      bottom: 50,
      left: 45,
      right: 50,
      top: 45,
      x: 50,
      y: 50
    })
  })
})
