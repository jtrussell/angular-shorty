/*jshint node:true */

module.exports = function(grunt) {
  'use strict';

  // Project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: 'gruntfile.js',
      src: 'src/**/*.js',
      spec: {
        options: {
          jshintrc: 'test/spec/.jshintrc'
        },
        src: 'test/spec/**/*.js'
      }
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      gruntfile: {
        files: {
          src: [
            'Gruntfile.js'
          ]
        }
      },
      spec: {
        files: {
          src: [
            'test/spec/**/*.js'
          ]
        }
      },
      scripts: {
        files: {
          src: [
            'src/scripts/**/*.js'
          ]
        }
      }
    },

    clean: {
      dist: 'dist'
    },

    concat: {
      options: {separator: '\n'},
      dist: {
        src: ['src/scripts/module.js', 'src/scripts/**/*.js'],
        dest: 'dist/shorty.js'
      }
    },

    uglify: {
      dist: {
        src: 'dist/shorty.js',
        dest: 'dist/shorty.min.js'
      }
    },

    jasmine: {
      spec: {
        src: ['src/scripts/*.js', 'src/scripts/**/*.js'],
        options: {
          specs: 'test/spec/**/*.js',
          vendor: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js'
          ]
        }
      }
    },

    watch: {
      scripts: {
        files: 'src/scripts/**/*.js',
        tasks: ['test', 'build:scripts']
      },
      tests: {
        files: 'test/spec/**/*.js',
        tasks: ['test']
      }
    },

    bump: {
      options: {
        commitMessage: 'chore: Bump for release (v%VERSION%)',
        files: ['package.json', 'bower.json'],
        commitFiles: ['*'],
        push: false
      }
    }
  });

  // Load plugins
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', [
    'jshint',
    'jscs',
    'jasmine'
  ]);

  grunt.registerTask('build', [
    'concat',
    'uglify'
  ]);

  grunt.registerTask('default', [
    'clean',
    'test',
    'build'
  ]);

};
