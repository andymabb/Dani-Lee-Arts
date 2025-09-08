# Dani Lee Arts - Website

Community Arts Mosaic Cob Carmarthenshire Earth Art website built with modern Gulp workflow.

## Features
- ✅ Modern Gulp build system with cache busting
- ✅ CSS processing with PostCSS + Autoprefixer  
- ✅ JavaScript minification with Terser
- ✅ HTML templating with includes (header/footer)
- ✅ Live reload development server
- ✅ Dynamic navigation system
- ✅ 91% UK browser coverage
- ✅ Source maps for debugging
- ✅ Production builds

## Development

### Prerequisites
Requires Node.js 18+ and shared dependencies in parent MySites directory.

### Setup
```bash
# Dependencies are managed in parent MySites directory
cd "c:\Users\andy\MySites"
npm install  # (if not already done)

# Navigate to project
cd "Websites\Dani"

# Start development server
gulp dev
```

### Commands
- `gulp dev` - Development server with live reload (default)
- `gulp build` - Build for deployment  
- `gulp prod` - Production build (optimized)
- `gulp clean` - Clean dist folder

## Project Structure
```
src/
  css/
    style.css           # Main styles (with CSS imports)
    *.css              # Additional CSS files
  js/
    nav-active.js      # Dynamic navigation
    *.js              # Other JavaScript files
  includes/
    header.html        # Shared header template
    footer.html        # Shared footer template
  *.html              # Page templates
dist/                 # Built files (not committed)
gulpfile.js          # Modern build configuration
.browserslistrc      # Browser targeting (91% UK coverage)
```

## Changes
- **Development**: Only make changes in the `src` folder
- **Images**: Optimized images are added directly to the `dist` folder
- **Templates**: Header and footer are abstracted into includes
- **Navigation**: Uses dynamic nav-active.js script
- **Cache Busting**: CSS and JS files get timestamp hashes

## Key Features

### Template System
Header and footer are extracted into includes for easier maintenance:
- `src/includes/header.html` - Shared header
- `src/includes/footer.html` - Shared footer with scripts

### Dynamic Navigation  
The `nav-active.js` script automatically highlights the current page in navigation.

### Cache Busting
Built CSS and JS files include timestamps to force browser updates:
- `style-1234567890.css`
- `scripts-1234567890.min.js`

## Deployment
Built files are in the `dist/` directory and ready for upload to web server.
