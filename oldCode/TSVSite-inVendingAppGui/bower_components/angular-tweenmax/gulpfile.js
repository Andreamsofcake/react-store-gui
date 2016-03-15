var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('bundle', function() {
  return gulp
    .src('src/**/*.js')
    .pipe(concat('angular-tweenmax.js'))
    .pipe(gulp.dest('dist'));
});