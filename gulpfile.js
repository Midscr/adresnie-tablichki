const gulp = require('gulp');
const sass = require('gulp-sass');
const concatCss = require('gulp-concat-css');
const browserSync = require('browser-sync').create();

gulp.task('serve', ['sass'], function () {

  browserSync.init({
    proxy: "localhost:5000"
  });

  gulp.watch("./src/sass/*.scss", ['sass']).on('change', browserSync.reload);
  gulp.watch("./src/sass/stand/*.scss", ['sass_stand']).on('change', browserSync.reload);
  gulp.watch("./src/sass/plan/*.scss", ['sass_plan']).on('change', browserSync.reload);
  gulp.watch("./src/sass/tabl/*.scss", ['sass_tabl']).on('change', browserSync.reload);
  gulp.watch("./views/*.pug").on('change', browserSync.reload);
  gulp.watch("/dist/js/*.js").on('change', browserSync.reload);

});


gulp.task('sass', function () {
  return gulp.src('./src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('style.css'))
    .pipe(gulp.dest('./public/dist/css'));

});

gulp.task('sass_stand', function () {
  return gulp.src('./src/sass/stand/stand.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('stand.css'))
    .pipe(gulp.dest('./public/dist/css'));

});

gulp.task('sass_plan', function () {
  return gulp.src('./src/sass/plan/plan.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('plan.css'))
    .pipe(gulp.dest('./public/dist/css'));

});

gulp.task('sass_tabl', function () {
  return gulp.src('./src/sass/tabl/tabl.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCss('tabl.css'))
    .pipe(gulp.dest('./public/dist/css'));

});

gulp.task('default', ['serve']);