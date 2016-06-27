import shallowEqualScalar from '../src/shallowEqualScalar.js'

describe("shallowEqualScalar", () => {
  it("should return true if the objects are the same", () => {
    const a = {}
    expect(shallowEqualScalar(a, a)).to.be.true
  })
  it("should return false if either thing is null", () => {
    expect(shallowEqualScalar(null, {})).to.be.false
    expect(shallowEqualScalar({}, null)).to.be.false
  })
  it("should return false if either thing is not an object", () => {
    expect(shallowEqualScalar({}, 1)).to.be.false
    expect(shallowEqualScalar(1, {})).to.be.false
  })
  it("should return false if the objects have different numbers of keys", () => {
    expect(shallowEqualScalar({a: 1}, {a: 1, b: 2})).to.be.false
  })
  it("should return false if objects have different keys", () => {
    expect(shallowEqualScalar({a: 1}, {b: 1})).to.be.false
  })

  it("should return false if objects have the same key, and same value that are objects", () => {
    const a = {}
    expect(shallowEqualScalar({ a }, { a })).to.be.false
  })

  it("should return false if objects have the same key, and different values", () => {
    expect(shallowEqualScalar({ a: 1 }, { a: 2 })).to.be.false
  })

  it("should return true if objects have the same keys and same non-object values", () => {
    expect(shallowEqualScalar({ a: 1 }, { a: 1 })).to.be.true
  })
})
