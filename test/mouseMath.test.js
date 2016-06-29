import 'should'
import mouseMath from '../src/mouseMath.js'

describe("mouseMath", function() {
  const e = {
    pageX: 50,
    pageY: 50
  }

  describe("isClick", () => {
    it("should accept a valid value", () => {
      mouseMath.isClick(e, { x: 50, y: 50 }, 5).should.be.true
    })

    it("should accept a valid value within tolerance", () => {
      const a = mouseMath.isClick(e, { x: 55, y: 50 }, 5)
      expect(a, "x is 55").to.be.true

      const b = mouseMath.isClick(e, { x: 50, y: 55 }, 5)
      expect(b, "y is 55").to.be.true
    })

    it("should fail outside tolerance", () => {
      const a = mouseMath.isClick(e, { x: 56, y: 50 }, 5)
      expect(a, "x is 56").to.be.false

      const b = mouseMath.isClick(e, { x: 50, y: 44 }, 5)
      expect(b, "y is 44").to.be.false
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

    mouseMath.getBoundsForNode(mock, window, () => 0).should
      .eql({
        bottom: 48,
        left: 40,
        right: 48,
        top: 40
      })

    mouseMath.getBoundsForNode(mock, window, (dir) => dir === 'left' ? 0 : 5).should
      .eql({
        bottom: 53,
        left: 40,
        right: 48,
        top: 45
      })

    mouseMath.getBoundsForNode(mock, window, (dir) => dir === 'left' ? 5 : 0).should
      .eql({
        bottom: 48,
        left: 45,
        right: 53,
        top: 40
      })

    mock.offsetHeight = 10
    mock.offsetWidth = 10

    mouseMath.getBoundsForNode(mock, window, () => 0).should
      .eql({
        bottom: 50,
        left: 40,
        right: 50,
        top: 40
      })

    mock.offsetHeight = undefined
    mock.offsetWidth = undefined

    mouseMath.getBoundsForNode(mouseMath.getBoundsForNode(mock, window, () => 0)).should
      .eql({
        bottom: 40,
        left: 40,
        right: 40,
        top: 40
      })
  })

  describe("pageOffset", () => {
    const mockwin = {
      document: {
        body: {
          scrollTop: 0,
          scrollLeft: 0
        }
      }
    }

    it("should return 0 by default", () => {
      const a = mouseMath.pageOffset('left', false, mockwin)
      expect(a).to.equal(0)
      const b = mouseMath.pageOffset('top', false, mockwin)
      expect(b).to.equal(0)
    })

    it("should return pageXOffset/pageYOffset", () => {
      mockwin.pageXOffset = 4
      mockwin.pageYOffset = 3
      const a = mouseMath.pageOffset('left', false, mockwin)
      expect(a).to.equal(4)
      const b = mouseMath.pageOffset('top', false, mockwin)
      expect(b).to.equal(3)
    })

    it("should return parent pageXOffset/pageYOffset as first choice", () => {
      mockwin.pageXOffset = 2
      mockwin.pageYOffset = 1
      const a = mouseMath.pageOffset('left', false, mockwin)
      expect(a).to.equal(2)
      const b = mouseMath.pageOffset('top', false, mockwin)
      expect(b).to.equal(1)
    })

    it("should throw on incorrect direction", () => {
      (() => mouseMath.pageOffset('foo', mockwin)).should.throw("direction must be one of top or left, was \"foo\"")
    })

    it("should use the parent window if asked to", () => {
      if ((window.____isjsdom)) return
      mockwin.parent = {
        window: {
          pageXOffset: 123
        }
      }
      expect(mouseMath.pageOffset('left')).to.equal(0)
    })
  })

  describe("browser-specific tests: not scrolling", function() {
    const div = document.createElement('div')
    before(() => {
      if (window.____isjsdom) return
      div.style.cssText = 'height: 50px;width:50px;position:absolute;top:5px;left:5px;'
      div.innerText = 'hi'
      div.id = 'foo'
      document.body.appendChild(div, document.body.firstElementChild)
      mouseMath.DOMFlush('foo')
    })

    after(() => {
      if (window.____isjsdom) return
      document.body.removeChild(div)
    })

    it("contains: should detect point inside", () => {
      if (window.____isjsdom) return

      const a = mouseMath.contains(div, 25, 25)
      expect(a).to.equal(true)
    })

    it("contains: should detect point outside", () => {
      if (window.____isjsdom) return

      const a = mouseMath.contains(div, 400, 400)
      expect(a).to.equal(false)
    })

    it("getBoundsForNode: no scroll", () => {
      if (window.____isjsdom) return

      const a = mouseMath.getBoundsForNode(div)
      a.should.eql({
        top: 5,
        left: 5,
        right: 55,
        bottom: 55
      })
    })
  })

  describe("browser-specific tests: scrolling", function() {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    const div = document.createElement('div')
    const div1 = document.createElement('div')
    before(() => {
      if (window.____isjsdom) return
      div1.style.cssText = 'height: 13000px;width:13000px'
      div1.innerText = 'hi'

      div.style.cssText = 'height: 50px;width:50px;position:absolute;top:5px;left:5px;background-color:red;'
      div.innerText = 'hi'
      div.id = 'foo'
      div1.appendChild(div)
      document.body.insertBefore(div1, document.body.firstElementChild)

      window.scroll(20, 20)
      if (iOS) window.parent.window.scroll(20, 20)
    })

    after(() => {
      if (window.____isjsdom) return
      document.body.removeChild(div1)
      window.scroll(0, 0)
      if (iOS) window.parent.window.scroll(0, 0)
    })

    it("pageOffset: should return the correct page offset", function() {
      if (window.____isjsdom) return

      const a = mouseMath.pageOffset('left', false, window)
      const b = mouseMath.pageOffset('top', false, window)

      // console.log('y', window.pageYOffset, b)
      // console.log('x', window.pageXOffset, a)

      expect(b).to.equal(20, "top should be 20")
      expect(a).to.equal(20, "left should be 20")
    })

    it("getBoundsForNode: with scroll", () => {
      if (window.____isjsdom) return

      const aa = mouseMath.pageOffset('left', false, window)
      const bb = mouseMath.pageOffset('top', false, window)

      expect(bb).to.equal(20, "top should be 20")
      expect(aa).to.equal(20, "left should be 20")

      // console.log('x', window.pageXOffset, window.parent.window.pageXOffset, aa)
      // console.log('y', window.pageYOffset, window.parent.window.pageYOffset, bb)

      const a = mouseMath.getBoundsForNode(div, window)
      // console.log(a)
      a.should.eql({
        top: 5,
        left: 5,
        right: 55,
        bottom: 55
      })
    })
  })

  describe("objectsCollide", () => {
    const obj = {
      top: 50,
      left: 50,
      right: 55,
      bottom: 55
    }

    it("should detect no collision when there is none", () => {
      mouseMath.objectsCollide(obj, {
        top: 56,
        left: 56,
        right: 66,
        bottom: 66
      }).should.eql(false)
    })

    it("should detect a collision when tolerance would make it", () => {
      mouseMath.objectsCollide(obj, {
        top: 40,
        left: 40,
        right: 49,
        bottom: 49
      }, 1).should.eql(true, 'tolerance collision failed')
    })

    it("should detect a collision with a mouse click", () => {
      mouseMath.objectsCollide(obj, {
        top: 50,
        left: 50
      }).should.eql(true, '50')

      mouseMath.objectsCollide(obj, {
        top: 55,
        left: 55
      }).should.eql(true, '55')

      mouseMath.objectsCollide(obj, {
        top: 53,
        left: 53
      }).should.eql(true, '53')
    })

    it("should fail a collision", () => {
      mouseMath.objectsCollide({
        top: 55,
        left: 56
      }, obj).should.eql(false)
    })
  })

  describe("contains", () => {
    it("should return true for no element", () => {
      mouseMath.contains(false, 1, 0, null).should.eql(true)
    })

    it("should call elementFromPoint and contains", () => {
      const doc = {
        elementFromPoint: sinon.stub()
      }
      const elm = {
        contains: sinon.spy()
      }

      doc.elementFromPoint.returns('hi')

      mouseMath.contains(elm, 1, 2, doc)

      doc.elementFromPoint.called.should.eql(true, 'elementFromPoint was not called')
      elm.contains.called.should.eql(true, 'contains was not called')

      doc.elementFromPoint.calledWithExactly(1, 2).should.eql(true, 'called with point values')
      elm.contains.calledWithExactly('hi').should.eql(true, 'called with elementFromPoint return value')
    })
  })

  describe("getCoordinates", () => {
    it("should extract clientX and company", () => {
      mouseMath.getCoordinates({
        clientX: 1,
        foo: 3,
        clientY: 2,
        pageX: 3,
        pageY: 4
      }, 1).should.eql({
        clientX: 1,
        clientY: 2,
        pageX: 3,
        pageY: 4
      })
    })

    it("should extract clientX and company, mobile", () => {
      mouseMath.getCoordinates({
        clientX: 9,
        touches: [{
          clientX: 5,
          clientY: 6,
          pageX: 7,
          pageY: 8,
          identifier: 0
        }, {
          clientX: 1,
          clientY: 2,
          pageX: 3,
          pageY: 4,
          identifier: 1
        }],
        clientY: 10,
        pageX: 11,
        pageY: 12
      }, 1).should.eql({
        clientX: 1,
        clientY: 2,
        pageX: 3,
        pageY: 4
      })
    })

    it("should extract clientX and company, mobile", () => {
      mouseMath.getCoordinates({
        clientX: 9,
        touches: [{
          clientX: 5,
          clientY: 6,
          pageX: 7,
          pageY: 8,
          identifier: 0
        }, {
          clientX: 1,
          clientY: 2,
          pageX: 3,
          pageY: 4,
          identifier: 1
        }],
        clientY: 10,
        pageX: 11,
        pageY: 12
      }, 5, {
        warn: (t) => t.should.eql('no touch found with identifier')
      }).should.eql({
        clientX: 5,
        clientY: 6,
        pageX: 7,
        pageY: 8
      })
    })
  })
})
