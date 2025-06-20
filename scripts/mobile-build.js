
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for mobile platforms...');

try {
  // Build the web app
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy mobile-optimized index.html
  const mobileHtml = path.join(__dirname, '../public/capacitor.html');
  const distIndex = path.join(__dirname, '../dist/index.html');
  
  if (fs.existsSync(mobileHtml)) {
    console.log('📱 Copying mobile-optimized HTML...');
    fs.copyFileSync(mobileHtml, distIndex);
  }
  
  // Sync with Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });
  
  console.log('✅ Mobile build completed successfully!');
  console.log('\nNext steps:');
  console.log('1. For Android: npx cap run android');
  console.log('2. For iOS: npx cap run ios (requires Mac with Xcode)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
