module.exports = function(wallaby) {
  // There is a weird error with the mui and mantra.
  // See: https://goo.gl/cLH8ib
  // Using require here seems to be the error.
  // Renaming it into `load` just fixed the issue.
  const load = require;

  return {
    files: [
      { pattern: 'test/*.test.js', ignore: true },
      'test/**/*.js',
      'src/**/*.js*',
      { pattern: 'src/.stories/**/*.*', ignore: true, instrument: false },
      { pattern: 'src/index.js', ignore: true, instrument: false }
    ],
    tests: [
      { pattern: 'test/index.js', ignore: true, instrument: false },
      'test/*.test.js*'
    ],
    compilers: {
      '**/*.js*': wallaby.compilers.babel({
        babel: load('babel-core'),
        presets: ['es2015', 'stage-0', 'react']
      })
    },
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    setup: function() {
      // this fools meteor into ignoring the require statement.
      // otherwise, it will try to load jsdom into the web version build and server build.
      const fool = require
      const jsdom = fool('jsdom').jsdom
      const sinon = fool('sinon')
      const expect = fool('chai').expect
      const should = fool('should')

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
      const propagateToGlobal = (window) => {
        for (var key in window) {
          if (!window.hasOwnProperty(key)) continue
          if (key in global) continue

          global[key] = window[key]
        }
      }

// setup the simplest document possible
      const doc = jsdom('')
      const win = doc.defaultView
      global.document = doc
      global.window = win
      global.sinon = sinon
      global.expect = expect
      global.should = should

      propagateToGlobal(win)
      global.window.____isjsdom = true
    }
  };
};
