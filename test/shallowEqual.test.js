import shallowEqual from '../src/shallowEqual.js'

describe("shallowEqual", () => {
  it("should return true if the elements are the same", () => {
    const a = {}
    const b = a
    expect(shallowEqual(a, b)).to.be.true
  })
  it("should return false if the objects have different numbers of keys", () => {
    expect(shallowEqual({}, {a: 1})).to.be.false
  })
  it("should return false if the internal values are not the same", () => {
    expect(shallowEqual({ a: 1 }, { a: 2 })).to.be.false
    expect(shallowEqual({ a: [1] }, { a: [1] })).to.be.false
    expect(shallowEqual({ a: { a: 1 }}, { a: { a: 1 }})).to.be.false
  })
  it("should return true if the internal values are the same", () => {
    expect(shallowEqual({ a: 1 }, { a: 1 })).to.be.true
  })
})
