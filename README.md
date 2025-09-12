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

gulp dev

## Setup & Development

This project now uses a local `package.json` for all dependencies. To set up for development:

```powershell
# Install dependencies
npm install

# Start development server (auto-reloads on changes)
gulp dev
```

### Other Gulp Commands
- `gulp build`   # Build for deployment (dist/)
- `gulp prod`    # Production build (minified, cache-busted)
- `gulp clean`   # Remove all files from dist/

## Notes
- Make all edits in the `src/` folder. Do not edit files in `dist/` directly.
- Header and contact bar are now centralized in `src/includes/header.html`.
- All FTP deployment and related packages have been removed. Use standard web hosting or GitHub for deployment.

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
- **Images**: Images are resized and converted to avif format *before* being added to src/img folder
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


