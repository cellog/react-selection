/* eslint no-var: 0, babel/object-shorthand: 0, vars-on-top: 0 */
require('babel-register')

var isCI = process.env.CONTINUOUS_INTEGRATION === 'true'
var reporters = ['mocha', 'saucelabs']
var singleRun = true

var sauceParams = {
  testName: "react-selection-hoc unit tests",
  username: process.env.SAUCEUSER,
  accessKey: process.env.ACCESSSAUCE
}

if (isCI) {
  sauceParams.build = process.env.TRAVIS_BUILD_NUMBER
} else {
  sauceParams.build = `Local Testing ${process.env.CURRENTTIME}`
  sauceParams.startConnect = false
}

module.exports = function(config, extraoptions) {
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

    captureTimeout: 1200000,
    browserNoActivityTimeout: 45000,

    singleRun,

    ...extraoptions
  })
}
