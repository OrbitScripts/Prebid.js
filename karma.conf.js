// This configures Karma, describing how to run the tests and where to output code coverage reports.
//
// For more information, see http://karma-runner.github.io/0.13/config/configuration-file.html

var webpackConfig = require('./webpack.conf');
var path = require('path');

webpackConfig.module.rules.push({
  enforce: 'post',
  exclude: /(node_modules)|(test)|(integrationExamples)|(build)|polyfill.js|(src\/adapters\/analytics\/ga.js)/,
  loader: 'istanbul-instrumenter-loader',
  test: /\.js$/
});

// remove optimize plugin for tests
webpackConfig.plugins.pop();

var CI_MODE = process.env.NODE_ENV === 'ci';

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // BrowserStack Config
    browserStack: {
      username: process.env.BROWSERSTACK_USERNAME,
      accessKey: process.env.BROWSERSTACK_KEY
    },

    // define browsers
    customLaunchers: require('./browsers.json'),

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['es5-shim', 'mocha', 'expect', 'sinon'],

    // list of files / patterns to load in the browser
    files: [
      'test/helpers/prebidGlobal.js',
      'test/**/*_spec.js',
      'test/helpers/karma-init.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*_spec.js': ['webpack'],
      'test/helpers/prebidGlobal.js': ['webpack'],
      'src/**/*.js': ['webpack']
    },

    // WebPack Related
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: CI_MODE ? ['coverage-istanbul'] : ['progress', 'coverage-istanbul'],

    // junit reporter config
    junitReporter: {
      outputDir: 'test'
    },

    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      dir: path.join(__dirname, 'build', 'coverage'),
      'report-config': {
        html: {
          subdir: 'karma_html',
          urlFriendlyName: true, // simply replaces spaces with _ for files/dirs
          // reportName: 'report' // report summary filename; browser info by default
        }
      }
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // NOTE: these get defined again in gulpfile.js for the gulp tasks
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
    browserDisconnectTimeout: 10000, // default 2000
    browserDisconnectTolerance: 1, // default 0
    browserNoActivityTimeout: 4 * 60 * 1000, // default 10000
    captureTimeout: 4 * 60 * 1000, // default 60000

    plugins: [
      'karma-browserstack-launcher',
      'karma-phantomjs-launcher',
      'karma-coverage-istanbul-reporter',
      'karma-es5-shim',
      'karma-mocha',
      'karma-expect',
      'karma-sinon-ie',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-sauce-launcher',
      'karma-firefox-launcher',
      'karma-opera-launcher',
      'karma-safari-launcher',
      'karma-script-launcher',
      'karma-requirejs',
      'karma-ie-launcher'
    ]
  });
};
