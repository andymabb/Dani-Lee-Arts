# 🔧 Reusable Gulpfile Configuration System

This gulpfile is now **reusable across multiple projects** using a configuration file approach!

## 📁 Configuration Files

### `project.config.js` 
Contains all project-specific settings:
- GitHub repository details
- FTP server settings  
- File paths
- Build options
- Server configuration

### `.env` (optional)
Contains sensitive credentials:
```bash
FTP_HOST=your-server.com
FTP_USER=username
FTP_PASS=password
FTP_REMOTE_PATH=/public_html/
```

## 🚀 Available Deployment Commands

### GitHub Only
- `gulp deploy` - Build + commit + push to GitHub
- `gulp prodDeploy` - Production build + GitHub deploy
- `gulp quickDeploy` - Instant GitHub deploy (no build)

### FTP Only  
- `gulp ftpDeploy` - Deploy all files to FTP server (overwrites everything)
- `gulp ftpSmart` - Only upload files newer than remote server
- `gulp ftpSelective` - **RECOMMENDED** - Force HTML/CSS/JS, smart images/assets
- `gulp ftpClean` - Clean FTP directory before deploy

### Combined Deployment
- `gulp deployAll` - Build + GitHub + FTP deployment
- `gulp prodDeployAll` - Production build + GitHub + FTP

### Development
- `gulp` or `gulp dev` - Development server with live reload
- `gulp devWithDeploy` - Development + auto-deploy to GitHub

## 🔄 Setting Up for New Projects

### 1. Copy Files
Copy these files to your new project:
```
gulpfile.js
project.config.js
.env.example
```

### 2. Update Configuration
Edit `project.config.js`:
```javascript
module.exports = {
  projectName: 'My New Website',
  github: {
    repository: 'https://github.com/username/new-repo.git',
    branch: 'main'
  },
  ftp: {
    enabled: true, // Enable FTP if needed
    host: 'your-server.com'
    // ... other FTP settings
  }
};
```

### 3. Setup Credentials (if using FTP)
Copy `.env.example` to `.env` and add real credentials:
```bash
cp .env.example .env
# Edit .env with your real FTP details
```

### 4. Install Dependencies
In your MySites directory:
```bash
npm install vinyl-ftp dotenv
```

## 🛠️ FTP Configuration

### Enable FTP Deployment
In `project.config.js`:
```javascript
ftp: {
  enabled: true, // Set to true
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASS,
  remotePath: process.env.FTP_REMOTE_PATH || '/public_html/',
  parallel: 5
}
```

### Test FTP Connection
```bash
gulp ftpDeploy
```

## 📋 Configuration Options

### Build Settings
```javascript
build: {
  browsers: '> 0.1%, last 2 versions, not dead',
  production: {
    removeConsole: true,
    minifyHTML: true,
    sourcemaps: false
  },
  cacheBusting: true
}
```

### Auto-Deploy Settings
```javascript
autoDeploy: {
  debounceTime: 5000, // Wait time after changes
  commitMessage: {
    prefix: 'Auto-update',
    includeTimestamp: true,
    timezone: 'Europe/London'
  }
}
```

## � FTP Deployment Strategies

### `gulp ftpSelective` ⭐ **RECOMMENDED**
- **HTML/CSS/JS files**: Always uploaded (they have cache-busting names)
- **Images/Media files**: Only uploaded if newer than server version
- **Best for**: Regular updates - fast and efficient

### `gulp ftpSmart`
- **All files**: Only uploaded if newer than server version  
- **Best for**: Initial deployment or major changes

### `gulp ftpDeploy`
- **All files**: Always uploaded (overwrites everything)
- **Best for**: Force refresh or troubleshooting

### File Type Handling
```javascript
// Always uploaded (cache-busted):
*.html, *.css, *.js, *.map

// Only if newer:
*.jpg, *.jpeg, *.png, *.gif, *.webp, *.avif, 
*.svg, *.ico, *.pdf, *.mp3, *.mp4, *.zip
```

## �🔒 Security

- ✅ `.env` file is in `.gitignore` 
- ✅ FTP credentials are environment variables
- ✅ Configuration separate from sensitive data
- ✅ Example files provided for setup

## 🎯 Benefits

1. **Reusable**: Same gulpfile for all projects
2. **Configurable**: Each project has its own settings
3. **Secure**: Credentials in environment variables
4. **Flexible**: Enable/disable features per project
5. **Maintainable**: Update gulpfile once, benefits all projects

## 🚀 Quick Start New Project

```bash
# 1. Copy configuration
cp /path/to/dani/project.config.js ./
cp /path/to/dani/gulpfile.js ./
cp /path/to/dani/.env.example ./

# 2. Update project.config.js with your details

# 3. Setup credentials (if needed)
cp .env.example .env
# Edit .env

# 4. Start development
gulp dev
```

Your gulpfile is now **project-agnostic and reusable**! 🎉
