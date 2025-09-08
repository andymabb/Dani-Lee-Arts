# 🚀 Automated GitHub Deployment

Your website now has automated GitHub deployment capabilities! Here are all the options available:

## Deploy Commands

### `gulp deploy`
**Full build + deploy**
- Cleans and rebuilds entire website
- Commits all changes with timestamp
- Pushes to GitHub
- **Use this for:** Major updates, new features

### `gulp prodDeploy` 
**Production build + deploy**
- Sets NODE_ENV=production (removes console.log)
- Full clean and rebuild
- Commits and pushes to GitHub
- **Use this for:** Final production releases

### `gulp quickDeploy`
**Instant deploy (no build)**
- Commits current files as-is
- Pushes to GitHub immediately
- **Use this for:** Quick fixes, documentation updates

### `gulp devWithDeploy`
**Development with auto-deploy**
- Starts development server
- Watches for file changes
- Auto-deploys 5 seconds after changes stop
- **Use this for:** Active development with continuous backup

## Individual Git Commands

You can also run git operations separately:

- `gulp gitAdd` - Stage all changes
- `gulp gitCommit` - Commit with auto-generated message
- `gulp gitPush` - Push to GitHub

## Automatic Commit Messages

All commits include:
- Timestamp (UK timezone)
- Standard message about updates
- Bullet points describing changes

Example:
```
Auto-update: 08/09/2025, 13:47

- Updated source files and built assets
- Cache-busted CSS and JS files
- Ready for production deployment
```

## Workflow Recommendations

### Daily Development
```bash
gulp devWithDeploy
```
Start this once - it will auto-deploy your changes!

### Quick Fixes
```bash
# Edit files, then:
gulp quickDeploy
```

### Major Updates
```bash
gulp deploy
```

### Production Release
```bash
gulp prodDeploy
```

## Safety Features

- ✅ **No conflicts**: Automatic timestamps prevent commit conflicts
- ✅ **Smart detection**: Won't commit if no changes exist
- ✅ **Error handling**: Clear error messages if git operations fail
- ✅ **Debounced auto-deploy**: Waits 5 seconds after changes stop
- ✅ **Full paths**: Uses complete git.exe path to avoid PATH issues

## GitHub Repository

Your complete website is backed up at:
**https://github.com/andymabb/Dani-Lee-Arts**

Anyone can recreate the website with:
```bash
git clone https://github.com/andymabb/Dani-Lee-Arts.git
cd Dani-Lee-Arts
npm install
gulp build
```

## 🎉 You're All Set!

Your website now automatically backs up to GitHub every time you make changes. No more worrying about losing your work!
