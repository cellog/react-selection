import selectedList from '../src/selectedList.js'

describe("selectedList", () => {
  let sel
  beforeEach(() => {
    sel = new selectedList
  })
  describe("xor", () => {
    it("should deselect common items", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [2, 3]

      sel.xor(newOnes, oldOnes).should.eql([1, 4])
    })

    it("should select not in common items from the end of the new array", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [2, 3, 4, 5]

      sel.xor(newOnes, oldOnes).should.eql([1, 5])
    })

    it("should select not in common items from the start of new array", () => {
      const oldOnes = [1, 2, 3, 4]
      const newOnes = [0, 1, 2, 3, 4]

      sel.xor(newOnes, oldOnes).should.eql([0])
    })

    it("should select not in common items from the middle of new array", () => {
      const oldOnes = [0, 2, 4, 6]
      const newOnes = [1, 2, 3, 4, 5, 6]

      sel.xor(newOnes, oldOnes).should.eql([0, 1, 3, 5])
    })
  })

  describe("or", () => {
    it("should select all items in common, with no duplicates", () => {
      const oldOnes = [0, 2, 4, 6]
      const newOnes = [1, 2, 3, 4, 5, 6]

      sel.or(newOnes, oldOnes).should.eql([0, 1, 2, 3, 4, 5, 6])
    })
  })

  describe("removed", () => {
    it("should select all items removed from the old list", () => {
      const oldOnes = [0, 2, 3, 6]
      const newOnes = [0, 1, 3, 4, 5]

      sel.changed(newOnes, oldOnes).should.eql([2, 6])
    })
  })

  describe("added", () => {
    it("should select all items removed from the old list", () => {
      const oldOnes = [0, 2, 3, 6]
      const newOnes = [0, 1, 3, 4, 5]

      sel.changed(oldOnes, newOnes).should.eql([1, 4, 5])
    })
  })
})
