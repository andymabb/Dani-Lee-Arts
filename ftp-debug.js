// Debug FTP Configuration
function debugFtpConfig(done) {
  console.log('\n🔍 FTP Configuration Debug:\n');
  console.log('Environment variables:');
  console.log('FTP_HOST:', process.env.FTP_HOST);
  console.log('FTP_USER:', process.env.FTP_USER);
  console.log('FTP_PASS:', process.env.FTP_PASS ? '[SET]' : '[NOT SET]');
  console.log('FTP_REMOTE_PATH:', process.env.FTP_REMOTE_PATH);
  
  console.log('\nConfig object values:');
  console.log('config.ftp.host:', config.ftp.host);
  console.log('config.ftp.user:', config.ftp.user);
  console.log('config.ftp.password:', config.ftp.password ? '[SET]' : '[NOT SET]');
  console.log('config.ftp.remotePath:', config.ftp.remotePath);
  console.log('config.ftp.enabled:', config.ftp.enabled);
  
  done();
}

exports.ftpDebug = debugFtpConfig;
