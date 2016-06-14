'use strict';

var grunt = require('grunt');
var fs = require('fs');

var version = JSON.parse(fs.readFileSync('./package.json')).version;

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-jsdoc');
grunt.loadNpmTasks('grunt-karma');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-serve');
grunt.loadNpmTasks('grunt-banner');
grunt.loadNpmTasks('grunt-shell-spawn');
grunt.loadNpmTasks('grunt-env');

module.exports = function(grunt) {

    // comma separated list of browsers to run tests inside
    var browsers = grunt.option('browsers') ? grunt.option('browsers').split(',') : ['ChromeTest'];

    // Project configuration.
    grunt.initConfig({
        uglify: {
            dist: {
                options: {
                    sourceMap: true,
                    sourceMapName: 'build/popper.min.js.map',
                    preserveComments: /(?:license|version)/
                },
                files: {
                    'build/popper.min.js': ['build/popper.js']
                }
            }
        },
        copy: {
            dist: {
                nonull: true,
                src: 'src/popper.js',
                dest: 'build/popper.js',
            }
        },
        jsdoc : {
            dist : {
                src: 'src/*.js',
                dest: 'doc',
                options: {
                    template: 'doc/template',
                    query: 'json'
                }
            }
        },
        karma: {
            options: {
                captureTimeout: 3e5,
                browserNoActivityTimeout: 3e5,
                browserDisconnectTimeout: 3e5,
                browserDisconnectTolerance: 3,
                frameworks: ['jasmine'],
                singleRun: true,
                browserStack: {
                    username: process.env.BROWSERSTACK_USERNAME,
                    accessKey: process.env.BROWSERSTACK_KEY,
                },
                browsers: browsers,
                customLaunchers: {
                    'ChromeTest': {
                        base: 'Chrome',
                        flags: ['--window-size=800,872'] // 800x800 plus karma shell
                    },
                    'bs_firefox_mac': {
                        base: 'BrowserStack',
                        browser: 'firefox',
                        browser_version: 'latest',
                        os: 'OS X',
                        os_version: 'El Capitan'
                    },
                    'bs_chrome_mac': {
                        base: 'BrowserStack',
                        browser: 'chrome',
                        browser_version: 'latest',
                        os: 'OS X',
                        os_version: 'El Capitan'
                    },
                    'bs_safari_mac': {
                        base: 'BrowserStack',
                        browser: 'safari',
                        browser_version: 'latest',
                        os: 'OS X',
                        os_version: 'El Capitan'
                    },
                    'bs_ie11_win': {
                        base: 'BrowserStack',
                        browser: 'ie',
                        browser_version: '11',
                        os: 'Windows',
                        os_version: '10'
                    },
                    'bs_ie10_win': {
                        base: 'BrowserStack',
                        browser: 'ie',
                        browser_version: '10',
                        os: 'Windows',
                        os_version: '7'
                    },
                    'bs_ie9_win': {
                        base: 'BrowserStack',
                        browser: 'ie',
                        browser_version: '9',
                        os: 'Windows',
                        os_version: '7'
                    },
                    'bs_edge_win': {
                        base: 'BrowserStack',
                        browser: 'edge',
                        browser_version: 'latest',
                        os: 'Windows',
                        os_version: '10'
                    },
                },
                files: [
                    { pattern: 'bower_components/**/*.js', included: false },
                    { pattern: 'bower_components/requirejs/require.js', included: true },
                    { pattern: 'src/**/*.js', included: false },
                    'tests/*.js',
                    'tests/styles/*.css'
                ]
            },
            unit: {},
            local: {
                singleRun: false,
            }
        },
        jshint: {
            default: ['src/**/*.js']
        },
        serve: {
            options: {
                port: 9000
            }
        },
        usebanner: {
            dist: {
                options: {
                    replace: '\{\{version\}\}',
                    banner: version,
                    position: 'replace',
                },
                files: {
                    src: [ 'build/popper.js' ]
                }
            }
        },
        shell: {
            xvfb: {
                command: 'Xvfb :99 -ac -screen 0 1600x1200x24',
                options: {
                    async: true
                }
            }
        },
        env: {
            xvfb: {
                DISPLAY: ':99'
            }
        },
    });

    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('dist', [ 'copy:dist', 'usebanner:dist', 'uglify:dist']);
    grunt.registerTask('test', ['jshint', 'karma:local']);
    grunt.registerTask('test-ci', ['jshint', 'shell:xvfb', 'env:xvfb', 'karma:unit', 'shell:xvfb:kill']);
};
