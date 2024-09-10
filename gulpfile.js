// Dependencies
const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require("gulp-postcss");
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('autoprefixer');
const postcssImport = require("postcss-import");
const sourcemaps = require("gulp-sourcemaps");
const minifyHTML = require("gulp-htmlmin");
const browserSync = require('browser-sync');
const cachebust = require('gulp-cache-bust');
const server = browserSync.create();

const paths = {
  js: {
    src: 'src/js/*.js',
    dest: 'dist/js/'
  },
  css: {
    src: 'src/css/style.css',
    dest: 'dist/css/'
  },

  html: {
    src:  "src/**/*.+(html|htm|php)",
    dest: "dist"
  },
  images:{
    src: "src/images/**/*.+(jpg|jpeg|png|svg|avif)",
    dest: "dist/images/"
  }
};

function css(){
  var plugins=[
    postcssImport(),
    autoprefixer()
  ]
  return gulp.src(paths.css.src)
    .pipe(cleanCSS())
    .pipe( sourcemaps.init() )
    .pipe( postcss(plugins) )
    .pipe( sourcemaps.write('.') )
    .pipe( gulp.dest(paths.css.dest) )
}
exports.css = css;

function js() {
  return gulp.src(paths.js.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(paths.js.dest));
}
exports.js = js;

function images(){
  return gulp.src(paths.images.src)
  .pipe(gulp.dest(paths.images.dest))
}
exports.images = images;

function html(){
    return gulp.src(paths.html.src)
        .pipe(cachebust({type: 'timestamp'}))
        .pipe(minifyHTML({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.html.dest))
}
exports.html = html;

function reload(done) {
  server.reload();
  done();
}

// Static (html) files
function serve(done) {
  server.init({
    server: {
      baseDir: "./dist"
    }
  });
  done();
}

const watch = () => gulp.watch('src/**/*.*', gulp.series(html, css, js,  reload));

// add images task after js task if required;

const dev = gulp.series(html, css, js, serve, watch);
exports.default=dev;
