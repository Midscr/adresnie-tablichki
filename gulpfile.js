const gulp = require('gulp');
const sass = require('gulp-sass');
const concatCss = require('gulp-concat-css');
const browserSync = require('browser-sync').create();

gulp.task('serve', ['sass'], function () {

  browserSync.init({
    proxy: "localhost:4000"
  });

  gulp.watch("./src/sass/*.scss", ['sass']).on('change', browserSync.reload);
  gulp.watch("./views/*.pug").on('change', browserSync.reload);
  gulp.watch("/dist/js/*.js").on('change', browserSync.reload);

});


gulp.task('sass', function () {
  return gulp.src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(gulp.dest('./public/dist/css'));

});

gulp.task('default', ['serve']);