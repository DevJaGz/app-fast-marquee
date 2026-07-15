// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {},
      clearContext: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/ngx-fast-marquee'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }]
    },
    // karma-jasmine-html-reporter is interactive-only (renders a live DOM report) and interferes
    // with ChromeHeadless's minimal page — 'progress' is sufficient for CI/CLI runs.
    reporters: ['progress'],
    port: 9877,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    // ChromeHeadless (not plain Chrome): a backgrounded/unfocused browser window throttles or
    // pauses requestAnimationFrame, which the marquee engine's flush cycle relies on — headless
    // avoids that occlusion-based throttling entirely.
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true
  });
};
