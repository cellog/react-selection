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

  describe("getBoundsForNode", () => {
    const mock = {
      offsetWidth: 8,
      offsetHeight: 8,
      getBoundingClientRect() {
        return {
          left: 40,
          top: 40,
          right: 50,
          bottom: 50,
          width: 10,
          height: 10
        }
      }
    }

    mouseMath.getBoundsForNode(mock, () => 0).should
      .eql({
        bottom: 48,
        left: 40,
        right: 48,
        top: 40
      })

    mouseMath.getBoundsForNode(mock, (dir) => dir === 'left' ? 0 : 5).should
      .eql({
        bottom: 53,
        left: 40,
        right: 48,
        top: 45
      })

    mouseMath.getBoundsForNode(mock, (dir) => dir === 'left' ? 5 : 0).should
      .eql({
        bottom: 48,
        left: 45,
        right: 53,
        top: 40
      })

    mock.offsetHeight = 10
    mock.offsetWidth = 10

    mouseMath.getBoundsForNode(mock, () => 0).should
      .eql({
        bottom: 50,
        left: 40,
        right: 50,
        top: 40
      })

    mock.offsetHeight = undefined
    mock.offsetWidth = undefined

    mouseMath.getBoundsForNode(mock, () => 0).should
      .eql({
        bottom: 40,
        left: 40,
        right: 40,
        top: 40
      })
  })
})
