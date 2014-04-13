module.exports = function(grunt) {
  'use strict';

  //  Load Grunt Tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    uglify: {
      minify: {
        src: ['dist/unicorn.js'],
        dest: 'dist/unicorn.min.js'
      },
      bundle: {
        src: ['dist/bower.js'],
        dest: 'dist/unicorn.bundle.min.js'
      }
    },
    bower_concat: {
      build: {
        bowerOptions: {
          offline: true
        },
        dest: 'dist/bower.js'
      }
    },
    watchify: {
      build: {
        src: './source/**/*.js',
        dest: './dist/unicorn.js'
      },
      options: {
        debug: true
      }
    },
    watch: {
      options: {
        debounceDelay: 250,
        livereload: true
      },

      build: {
        files: ['source/**/*'],
        tasks: ['scripts']
      },

      test: {
        files: ['test/**/*.js'],
        tasks: ['testling']
      },
    },
    testling: { 
      build: {

      }
    }
  });

  // register subtasks
  grunt.registerTask('scripts', ['watchify']);
  grunt.registerTask('bundle', ['bower_concat', 'scripts', 'uglify'])

  // register main tasks
  grunt.registerTask('test', ['bundle', 'testling', 'watch']);
  grunt.registerTask('default', ['bundle', 'watch:build']);
};