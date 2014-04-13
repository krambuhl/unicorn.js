var gulp = require('gulp');

var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var livereload = require('gulp-livereload');
var bower = require('gulp-bower');

 // gulp-concat gulp-uglify vinyl-source-stream watchify gulp-bower-files

var paths = {
  example: './example/**/*',
  scripts: './source/**/*.js',
  dist: './dist'
};

gulp.task('build', function() {

});

gulp.task("bower", function(){
  bower().pipe(console.log)
    // .pipe(gulp.dest(paths.dist))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['build']);

  var bundler = watchify('./source/unicorn.js');
  // bundler.transform('brfs');
  bundler.on('update', rebundle);

  function rebundle () {
    return bundler.bundle()
      .pipe(source('unicorn.js'))
      .pipe(gulp.dest(paths.dist))
      // .pipe(livereload());
  }

  return rebundle();
})

gulp.task('default', ['bower-files', 'watch']);