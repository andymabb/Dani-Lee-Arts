const gulp = require('gulp');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const postcss = require("gulp-postcss");
const sourcemaps = require("gulp-sourcemaps");
const minifyHTML = require("gulp-htmlmin");
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync');
const del = require('del');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const newer = require('gulp-newer');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// PostCSS plugins - simplified for modern browsers
const autoprefixer = require('autoprefixer');
const postcssImport = require("postcss-import");
const cssnano = require('cssnano');

const server = browserSync.create();

// Enhanced paths configuration
const paths = {
  js: {
    src: 'src/js/**/*.js',
    dest: 'dist/js/',
    watch: 'src/js/**/*.js'
  },
  css: {
    src: 'src/css/style.css',
    dest: 'dist/css/',
    watch: 'src/css/**/*.css'
  },
  html: {
    src: "src/*.html",
    includes: "src/includes/**/*.html",
    dest: "dist",
    watch: "src/**/*.html"
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/',
    watch: 'src/img/**/*'
  },
  static: {
    src: ['src/**/*', '!src/**/*.html', '!src/css/**/*', '!src/js/**/*', '!src/includes/**/*', '!src/img/**/*'],
    dest: 'dist'
  }
};

// Error handling
const onError = (err) => {
  notify.onError({
    title: "Gulp Error",
    message: "Error: <%= error.message %>"
  })(err);
  console.log(err.toString());
  this.emit('end');
};

function clean() {
  // Reset timestamp for new build
  buildTimestamp = null;
  
  // This selectively deletes the files Gulp generates,
  // leaving your images and other assets untouched.
  return del([
    'dist/css/**/*', // Delete contents of the css folder
    'dist/js/**/*',  // Delete contents of the js folder
    'dist/*.html'
  ], { force: true });
}

exports.clean = clean;

// Global timestamp for cache busting - generated once per build
let buildTimestamp;

function css(){
  if (!buildTimestamp) buildTimestamp = Date.now();
  
  // Optimized plugins for 91% UK browser coverage
  const plugins = [
    postcssImport(),
    // Autoprefixer will read from .browserslistrc (91% UK coverage)
    autoprefixer(),
    cssnano({
      preset: ['default', {
        discardComments: { removeAll: true }
      }]
    })
  ];
  
  return gulp.src(paths.css.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(postcss(plugins))
    .pipe(rename(path => {
      path.basename = `style-${buildTimestamp}`;
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(server.stream());
}
exports.css = css;

function js() {
  if (!buildTimestamp) buildTimestamp = Date.now();
  
  return gulp.src(paths.js.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.js'))
    .pipe(terser({
      // Modern browser target - can use more aggressive compression
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        ecma: 2020, // Target ES2020 (baseline supported)
        module: false
      },
      mangle: {
        toplevel: true
      },
      format: {
        ecma: 2020
      }
    }))
    .pipe(rename(path => {
      path.basename = `scripts-${buildTimestamp}`;
      path.extname = '.min.js';
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.js.dest));
}
exports.js = js;

function html() {
    if (!buildTimestamp) buildTimestamp = Date.now();
    
    return gulp.src(paths.html.src)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(replace('style.css', `style-${buildTimestamp}.css`))
        .pipe(replace('scripts.min.js', `scripts-${buildTimestamp}.min.js`))
        .pipe(minifyHTML({
            collapseWhitespace: true,
            removeComments: true,
            removeAttributeQuotes: false,
            conservativeCollapse: true
        }))
        .pipe(gulp.dest(paths.html.dest));
}

exports.html = html;

// Copy static files (excluding images which have their own task)
function copyStatic() {
  return gulp.src(paths.static.src, { dot: true })
    .pipe(newer(paths.static.dest))
    .pipe(gulp.dest(paths.static.dest));
}

// Copy images - only newer files for efficiency
function images() {
  return gulp.src(paths.images.src)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(newer(paths.images.dest))
    .pipe(gulp.dest(paths.images.dest));
}

function reload(done) {
  server.reload();
  done();
}

// Static (html) files
function serve(done) {
  server.init({
    server: {
      baseDir: "./dist"
    },
    notify: false,
    open: false // Don't auto-open browser
  });
  done();
}

// Watch functions
function watchFiles() {
  gulp.watch(paths.css.watch, gulp.series(css));
  gulp.watch(paths.js.watch, gulp.series(js, reload));
  gulp.watch(paths.html.watch, gulp.series(html, reload));
  gulp.watch(paths.images.watch, gulp.series(images, reload));
}

// Watch files and auto-deploy on changes
function watchWithDeploy() {
  // Debounce deployment to avoid too many commits
  let deployTimeout;
  const debouncedDeploy = () => {
    clearTimeout(deployTimeout);
    deployTimeout = setTimeout(() => {
      console.log('\n📁 File changes detected - starting auto-deployment...\n');
      deployToGitHub(() => {});
    }, 5000); // Wait 5 seconds after last change
  };

  gulp.watch(paths.css.watch, gulp.series(css, (done) => { debouncedDeploy(); done(); }));
  gulp.watch(paths.js.watch, gulp.series(js, reload, (done) => { debouncedDeploy(); done(); }));
  gulp.watch(paths.html.watch, gulp.series(html, reload, (done) => { debouncedDeploy(); done(); }));
  gulp.watch(paths.images.watch, gulp.series(images, reload, (done) => { debouncedDeploy(); done(); }));
}

// Task compositions
const buildAssets = gulp.parallel(css, js, images, copyStatic);
const build = gulp.series(clean, buildAssets, html);
const rebuild = gulp.series(gulp.parallel(css, js, images), html);
const dev = gulp.series(build, serve, watchFiles);
const devWithDeploy = gulp.series(build, serve, watchWithDeploy);

// Exports
exports.clean = clean;
exports.css = css;
exports.js = js;
exports.html = html;
exports.images = images;
exports.build = build;
exports.dev = dev;
exports.devWithDeploy = devWithDeploy;
exports.default = dev;

// Production build
exports.prod = gulp.series(
  (done) => { 
    process.env.NODE_ENV = 'production'; 
    done();
  },
  build
);

// Git automation functions
const gitPath = '"C:\\Program Files\\Git\\bin\\git.exe"';

async function gitAdd() {
  try {
    const { stdout, stderr } = await execAsync(`${gitPath} add .`);
    console.log('✓ Git add completed');
    if (stderr) console.log('Git warnings:', stderr);
    return Promise.resolve();
  } catch (error) {
    console.error('Git add failed:', error.message);
    return Promise.reject(error);
  }
}

async function gitCommit() {
  try {
    // Generate automatic commit message with timestamp
    const timestamp = new Date().toLocaleString('en-GB', { 
      timeZone: 'Europe/London',
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const commitMessage = `Auto-update: ${timestamp}

- Updated source files and built assets
- Cache-busted CSS and JS files
- Ready for production deployment`;

    const { stdout, stderr } = await execAsync(`${gitPath} commit -m "${commitMessage}"`);
    console.log('✓ Git commit completed');
    console.log('Commit details:', stdout);
    if (stderr) console.log('Git warnings:', stderr);
    return Promise.resolve();
  } catch (error) {
    if (error.message.includes('nothing to commit')) {
      console.log('✓ No changes to commit - repository is up to date');
      return Promise.resolve();
    }
    console.error('Git commit failed:', error.message);
    return Promise.reject(error);
  }
}

async function gitPush() {
  try {
    const { stdout, stderr } = await execAsync(`${gitPath} push`);
    console.log('✓ Git push completed');
    console.log('Push details:', stdout);
    if (stderr) console.log('Git info:', stderr);
    return Promise.resolve();
  } catch (error) {
    console.error('Git push failed:', error.message);
    return Promise.reject(error);
  }
}

// Combined deploy function
async function deployToGitHub(done) {
  try {
    console.log('\n🚀 Starting deployment to GitHub...\n');
    await gitAdd();
    await gitCommit();
    await gitPush();
    console.log('\n✅ Deployment completed successfully!\n');
    
    notify({
      title: 'Deployment Complete',
      message: 'Website deployed to GitHub successfully!',
      sound: 'Frog'
    });
    
    done();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    
    notify.onError({
      title: "Deployment Failed",
      message: "GitHub deployment failed: <%= error.message %>"
    })(error);
    
    done(error);
  }
}

// Export git functions
exports.gitAdd = gitAdd;
exports.gitCommit = gitCommit;
exports.gitPush = gitPush;

// Deploy tasks
exports.deploy = gulp.series(build, deployToGitHub);
exports.prodDeploy = gulp.series(
  (done) => { 
    process.env.NODE_ENV = 'production'; 
    done();
  },
  build,
  deployToGitHub
);

// Quick deploy (no build - just commit current state)
exports.quickDeploy = deployToGitHub;
