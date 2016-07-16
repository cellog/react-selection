/* eslint no-var: 0, babel/object-shorthand: 0, vars-on-top: 0 */
require('babel-register')

var isCI = process.env.CONTINUOUS_INTEGRATION === 'true'
var reporters = ['mocha', /* 'saucelabs', */ 'coverage']
var singleRun = true
var webpack = require('./test/test.config.es6.js')

var sauceParams = {
  testName: "react-selection-hoc unit tests",
  username: process.env.SAUCEUSER,
  accessKey: process.env.ACCESSSAUCE,
  connectOptions: {
    logfile: 'sauce_connect.log'
  }
}

var coverageReporter = isCI ? {
  reporters: [
    {
      type: 'lcov',
      dir: 'coverage'
    },
    {
      type: 'text'
    }
  ]
} : {
  reporters: [
    {
      type: 'lcov',
      dir: 'coverage'
    },
    {
      type: 'text'
    },
    {
      type: 'html'
    }
  ]
}
const frameworks = ['mocha', 'sinon-chai']
if (isCI) {
  sauceParams.build = process.env.TRAVIS_BUILD_NUMBER
} else {
  sauceParams.build = `Local Testing ${process.env.CURRENTTIME}`
  sauceParams.startConnect = false
}

module.exports = function (config, extraoptions) {
  config.set({

    basePath: '',

    frameworks,

    files: [
      '../*.test.js'
    ],

    preprocessors: {
      '../*.test.js': ['webpack'],
    },

    webpack,

    webpackMiddleware: {
      noInfo: true
    },

    reporters,

    mochaReporter: {
      output: 'autowatch'
    },

    port: 9876,

    colors: true,

    logLevel: config.LOG_DEBUG,

    autoWatch: true,

    sauceLabs: sauceParams,

    coverageReporter,


    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 4 * 60 * 1000, // default 10000
    captureTimeout: 4 * 60 * 1000, // default 60000
    singleRun,
    concurrency: 1,

    ...extraoptions
  })
}
