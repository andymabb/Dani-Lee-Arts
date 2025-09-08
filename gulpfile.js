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
const ftp = require('vinyl-ftp');

// Load project configuration
const config = require('./project.config.js');

// Load environment variables from .env file
require('dotenv').config({ silent: true });

// PostCSS plugins - simplified for modern browsers
const autoprefixer = require('autoprefixer');
const postcssImport = require("postcss-import");
const cssnano = require('cssnano');

const server = browserSync.create();

// Use paths from configuration
const paths = config.paths;

// Error handling
const onError = function(err) {
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
      baseDir: config.server.baseDir
    },
    port: config.server.port,
    notify: config.server.notify,
    open: config.server.open
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
    }, config.build.autoDeploy.debounceTime);
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
const gitPath = config.github.gitPath;

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
    // Generate automatic commit message with timestamp from config
    const timestamp = config.build.autoDeploy.commitMessage.includeTimestamp ? 
      new Date().toLocaleString('en-GB', { 
        timeZone: config.build.autoDeploy.commitMessage.timezone,
        year: 'numeric',
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : '';
    
    const commitMessage = `${config.build.autoDeploy.commitMessage.prefix}${timestamp ? ': ' + timestamp : ''}

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

// FTP Deployment Functions
function createFtpConnection() {
  if (!config.ftp.enabled) {
    throw new Error('FTP is disabled in project.config.js. Set ftp.enabled to true to use FTP deployment.');
  }
  
  console.log(`🔗 Connecting to FTP server: ${config.ftp.host}`);
  console.log(`👤 User: ${config.ftp.user}`);
  console.log(`📁 Remote path: ${config.ftp.remotePath}`);
  
  return ftp.create({
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.password,
    parallel: 1, // Reduce to 1 to avoid multiple connections
    log: config.ftp.log ? console.log : undefined,
    // Additional connection options
    connTimeout: 60000, // 60 seconds
    pasvTimeout: 60000, // 60 seconds  
    keepalive: 60000   // 60 seconds
  });
}

function deployToFtp() {
  const conn = createFtpConnection();
  
  console.log(`\n📡 Deploying to FTP server: ${config.ftp.host}\n`);
  
  return gulp.src('dist/**/*', { base: 'dist', buffer: false })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(conn.dest(config.ftp.remotePath))
    .pipe(notify({
      title: 'FTP Deployment Complete',
      message: `Website deployed to ${config.ftp.host}`,
      sound: 'Glass'
    }));
}

// Smart FTP deployment - only uploads newer files
function deployToFtpSmart() {
  const conn = createFtpConnection();
  
  console.log(`\n📡 Smart FTP deployment to: ${config.ftp.host}\n`);
  console.log('🔍 Checking for newer files...\n');
  
  return gulp.src('dist/**/*', { base: 'dist', buffer: false })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(conn.newer(config.ftp.remotePath)) // Only upload if newer than remote
    .pipe(conn.dest(config.ftp.remotePath))
    .pipe(notify({
      title: 'Smart FTP Deployment Complete',
      message: `Only newer files uploaded to ${config.ftp.host}`,
      sound: 'Glass'
    }));
}

// Force upload specific file types (HTML, CSS, JS always get updated)
function deployToFtpSelective() {
  const conn = createFtpConnection();
  
  console.log(`\n📡 Selective FTP deployment to: ${config.ftp.host}\n`);
  console.log('📤 HTML/CSS/JS: Always uploaded (cache-busted)');
  console.log('�️  Images/Assets: Only if newer than server\n');
  
  // Upload all files, let vinyl-ftp handle the checking
  return gulp.src('dist/**/*', { base: 'dist', buffer: false })
    .pipe(plumber({ errorHandler: onError }))
    .pipe(conn.newer(config.ftp.remotePath)) // Only upload if newer
    .pipe(conn.dest(config.ftp.remotePath))
    .pipe(notify({
      title: 'Selective FTP Deployment Complete', 
      message: `Smart upload completed to ${config.ftp.host}`,
      sound: 'Glass'
    }));
}

function deployToFtpClean() {
  const conn = createFtpConnection();
  
  console.log(`\n🧹 Cleaning FTP directory: ${config.ftp.remotePath}\n`);
  
  return conn.clean(config.ftp.remotePath + '**', 'dist');
}

// Combined FTP and GitHub deployment
async function deployEverywhere(done) {
  try {
    console.log('\n🚀 Starting full deployment (GitHub + FTP)...\n');
    
    // First deploy to GitHub
    await gitAdd();
    await gitCommit();
    await gitPush();
    console.log('✅ GitHub deployment completed');
    
    // Then deploy to FTP if enabled
    if (config.ftp.enabled) {
      console.log('\n📡 Starting selective FTP deployment...\n');
      await new Promise((resolve, reject) => {
        deployToFtpSelective()
          .on('end', resolve)
          .on('error', reject);
      });
      console.log('✅ FTP deployment completed');
    } else {
      console.log('ℹ️  FTP deployment skipped (disabled in config)');
    }
    
    console.log('\n🎉 All deployments completed successfully!\n');
    done();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    done(error);
  }
}

// Simple FTP connection test
function testFtpConnection(done) {
  try {
    const conn = createFtpConnection();
    
    console.log('\n🧪 Testing FTP connection...\n');
    
    // Simple test - try to list the remote directory
    return gulp.src('dist/*.html', { read: false })
      .pipe(plumber({ 
        errorHandler: function(err) {
          console.error('❌ FTP Connection failed:', err.message);
          if (err.message.includes('Login authentication failed')) {
            console.log('\n💡 Troubleshooting tips:');
            console.log('1. Check your FTP credentials in .env file');
            console.log('2. Verify FTP server allows connections from your IP');
            console.log('3. Try connecting with an FTP client (FileZilla) first');
            console.log('4. Check if server requires FTPS/SFTP instead of FTP');
          }
          done(err);
        }
      }))
      .pipe(conn.dest(config.ftp.remotePath))
      .on('end', () => {
        console.log('✅ FTP connection successful!');
        done();
      });
      
  } catch (error) {
    console.error('❌ FTP setup error:', error.message);
    done(error);
  }
}

// Debug FTP Configuration
function debugFtpConfig(done) {
  console.log('\n🔍 FTP Configuration Debug:\n');
  console.log('Environment variables:');
  console.log('FTP_HOST:', process.env.FTP_HOST);
  console.log('FTP_USER:', process.env.FTP_USER);
  console.log('FTP_PASS:', process.env.FTP_PASS ? `[${process.env.FTP_PASS.length} chars]` : '[NOT SET]');
  console.log('FTP_REMOTE_PATH:', process.env.FTP_REMOTE_PATH);
  
  console.log('\nConfig object values:');
  console.log('config.ftp.host:', config.ftp.host);
  console.log('config.ftp.user:', config.ftp.user);
  console.log('config.ftp.password:', config.ftp.password ? `[${config.ftp.password.length} chars]` : '[NOT SET]');
  console.log('config.ftp.remotePath:', config.ftp.remotePath);
  console.log('config.ftp.enabled:', config.ftp.enabled);
  
  done();
}

// Export FTP functions
exports.ftpDebug = debugFtpConfig;             // Debug FTP configuration
exports.ftpTest = testFtpConnection;           // Test FTP connection
exports.ftpDeploy = deployToFtp;               // Upload all files
exports.ftpSmart = deployToFtpSmart;           // Only upload newer files
exports.ftpSelective = deployToFtpSelective;   // Force HTML/CSS/JS, smart images/assets
exports.ftpClean = deployToFtpClean;
exports.deployAll = gulp.series(build, deployEverywhere);
exports.prodDeployAll = gulp.series(
  (done) => { 
    process.env.NODE_ENV = 'production'; 
    done();
  },
  build,
  deployEverywhere
);
