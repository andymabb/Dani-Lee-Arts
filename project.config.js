// Project Configuration
// This file contains all project-specific settings for the gulpfile
// Copy this file to other projects and modify as needed

module.exports = {
  // Project Information
  projectName: 'Dani Lee Arts',
  
  // GitHub Repository Configuration
  github: {
    repository: 'https://github.com/andymabb/Dani-Lee-Arts.git',
    branch: 'main',
    // Git executable path (Windows)
    gitPath: '"C:\\Program Files\\Git\\bin\\git.exe"'
  },
  
  // Build Configuration
  build: {
    // Browser targets (reads from .browserslistrc if present)
    browsers: '> 0.1%, last 2 versions, not dead, not IE > 0, not op_mini all',
    
    // Production optimizations
    production: {
      removeConsole: true,
      minifyHTML: true,
      sourcemaps: false // Set to true if you want sourcemaps in production
    },
    
    // Cache busting
    cacheBusting: true,
    
    // Auto-deploy settings
    autoDeploy: {
      debounceTime: 5000, // Wait 5 seconds after changes stop
      commitMessage: {
        prefix: 'Auto-update',
        includeTimestamp: true,
        timezone: 'Europe/London'
      }
    }
  },
  
  // Development Server Configuration
  server: {
    port: 3000,
    open: false, // Don't auto-open browser
    notify: false, // Disable browser notifications
    baseDir: './dist'
  },
  
  // File Paths (relative to project root)
  paths: {
    src: 'src',
    dist: 'dist',
    css: {
      src: 'src/css/style.css',
      watch: 'src/css/**/*.css',
      dest: 'dist/css/'
    },
    js: {
      src: 'src/js/**/*.js',
      watch: 'src/js/**/*.js',
      dest: 'dist/js/'
    },
    html: {
      src: 'src/*.html',
      includes: 'src/includes/**/*.html',
      watch: 'src/**/*.html',
      dest: 'dist'
    },
    images: {
      src: 'src/img/**/*',
      watch: 'src/img/**/*',
      dest: 'dist/img/'
    },
    static: {
      src: ['src/**/*', '!src/**/*.html', '!src/css/**/*', '!src/js/**/*', '!src/includes/**/*', '!src/img/**/*'],
      dest: 'dist'
    }
  }
};
