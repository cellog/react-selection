/* eslint no-var: 0, babel/object-shorthand: 0, vars-on-top: 0 */
require('babel-register')
var sauceBrowsers = require('./test/saucebrowsers.js')
var ieBrowsers = require('./test/onlyie.js')
var iosBrowsers = require('./test/onlyios.js')

var isCI = process.env.CONTINUOUS_INTEGRATION === 'true'
var reporters = ['mocha', 'saucelabs']
var browsers = process.env.ONLYIE ? ieBrowsers : sauceBrowsers
var browserKeys = Object.keys(browsers)
var singleRun = true

var sauceParams = {
  testName: "react-selection-hoc unit tests",
  username: process.env.SAUCEUSER,
  accessKey: process.env.ACCESSSAUCE
}
if (process.env.ONLYIOS) {
  browsers = iosBrowsers
  browserKeys = Object.keys(browsers)
}

if (isCI) {
  sauceParams.build = process.env.TRAVIS_BUILD_NUMBER
} else {
  sauceParams.startConnect = false
}

if (process.env.QUICKTEST) {
  browsers = {}
  browserKeys = ['Chrome']
  singleRun = false
}

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: [
      'mocha-debug',
      'mocha',
      'sinon-chai'
    ],

    files: [
      'test/index.js'
    ],

    preprocessors: {
      'test/index.js': ['webpack', 'sourcemap']
    },

    webpack: require('./test/test.config.es6.js'),

    webpackMiddleware: {
      noInfo: true
    },

    reporters: reporters,

    mochaReporter: {
      output: 'autowatch'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    sauceLabs: sauceParams,

    customLaunchers: browsers,
    browsers: browserKeys,

    captureTimeout: 1200000,
    browserNoActivityTimeout: 45000,

    singleRun
  })
}
