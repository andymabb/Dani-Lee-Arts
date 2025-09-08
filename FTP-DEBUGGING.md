# FTP Debugging Steps

## Issue
- FileZilla works with credentials
- Both vinyl-ftp and basic-ftp fail with "530 Login authentication failed"
- Username is accepted, password is rejected

## Possible Causes

1. **Password encoding issue**
   - Special characters: ^ru{6Hao0BBt
   - May need different escaping

2. **Case sensitivity**
   - Try: ^RU{6HAO0BBT
   - Try: ^ru{6hao0bbt

3. **FileZilla settings difference**
   - Check FileZilla connection type (FTP vs SFTP vs FTPS)
   - Check if FileZilla uses passive/active mode
   - Check character set settings

## Troubleshooting Steps

### 1. Verify exact credentials in FileZilla
   - File > Site Manager
   - Check the exact host, user, password
   - Check protocol (FTP, SFTP, FTPS)
   - Check encryption settings

### 2. Test different password formats
   Try these in .env file:
   ```
   FTP_PASS=^ru{6Hao0BBt
   FTP_PASS="^ru{6Hao0BBt"
   FTP_PASS='^ru{6Hao0BBt'
   ```

### 3. Check if server requires SFTP instead of FTP
   The error message might be misleading - server might require SFTP

### 4. Alternative: Use different deployment method
   - rsync over SSH
   - Git-based deployment
   - Manual upload via FileZilla with watch folder

## Current Status
✅ Connection to server works
✅ Username is accepted  
❌ Password authentication fails
✅ GitHub deployment works perfectly
