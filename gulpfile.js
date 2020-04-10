const gulp = require('gulp')

// Utility plugins
const plumber = require('gulp-plumber')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const del = require('del')

// CSS related plugins
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')

// JS related plugins
const uglify = require('gulp-uglify')
const browserify = require('browserify')
const babelify = require('babelify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')

// Browers related plugin
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

// Tasks
gulp.task('clean', function () {
  return del(['dist/**', 'dist/css/**', 'dist/js/**', 'dist/assets/**', '!dist', '!dist/css', '!dist/js', '!dist/assets'], { force: true });
});

gulp.task('copyAssetsToDist', function () {
  return gulp.src(['src/assets/**/*.*', '!src/assets/**/_*.*'])
    .pipe(gulp.dest('./dist/assets'))
    .pipe(browserSync.stream());
})

gulp.task('browserSync', function (done) {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  });
  done()
})

gulp.task("html", function () {
  return gulp.src('src/**/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
})

gulp.task("scss", function () {
  return gulp.src('src/scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      errorLogToConsole: true
    }))
    .on('error', console.error.bind(console))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream());
})

let jsSRC_1 = 'script.js'
let jsSRC_2 = 'script2.js'
let jsFOLDER = 'src/js/'
let jsDIST = './dist/js/'
let jsFILES = [jsSRC_1, jsSRC_2]

gulp.task("js", function (done) {
  // 1) Not Support ES6
  // return gulp.src('src/js/**/*.js')
  //   .pipe(gulp.dest('./dist/js/'))

  // 2) Compile and Bundle ES6 with Babel ( gulp 4 & bable 7 )
  // browserify
  // transform babelify
  // bundle
  // source
  // rename
  // buffer
  // init sourcemap
  // uglify
  // write sourcemap
  // dist
  jsFILES.map(function (entry) {
    return browserify({
      entries: [jsFOLDER + entry]
    })
      .transform(babelify, { presets: ['@babel/preset-env'] })
      .bundle()
      .pipe(source(entry))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(jsDIST))
      .pipe(browserSync.stream());
  });
  done()
})

gulp.task("compileAll", gulp.parallel('html', 'scss', 'js'), function (done) {
  done()
})

gulp.task("build", gulp.series('clean', 'copyAssetsToDist', 'compileAll'), function (done) {
  done()
})

gulp.task("default", gulp.series('clean', 'copyAssetsToDist', 'compileAll', 'browserSync', function (done) {
  gulp.watch('src/**/*.html', gulp.series('html'))
  gulp.watch('src/scss/**/*.scss', gulp.series('scss'))
  gulp.watch('src/js/**/*.js', gulp.series('js'))
  done()
}))

