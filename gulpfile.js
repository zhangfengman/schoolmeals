var gulp = require('gulp'),
    rjs = require('gulp-requirejs');
var requirejsOptimize = require('gulp-requirejs-optimize');
var shell = require('gulp-shell')
/*gulp.task('requirejsBuild', function() {
    return gulp.src('src/js/config/*.js')
        .pipe(requirejsOptimize({
         
            optimize: 'none',
            optimizeCss: 'standard',
            removeCombined: true,
            paths: {
                jquery: 'libs/jquery'

            }
        }))
        .pipe(gulp.dest('./dist')); // pipe it to the output DIR
});*/

gulp.task('rjsbuild', shell.task([
  'node r.js -o build.js'
]))
