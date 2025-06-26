
# Complete Hosting Guide for AgroSense Control Hub

## Namecheap cPanel Hosting Setup

### Step-by-Step cPanel Deployment

#### 1. Pre-deployment Preparation
```bash
# Build the application for production
npm run build

# This creates a 'dist' folder with all static files
# The 'dist' folder contains everything needed for hosting
```

#### 2. cPanel File Upload Process

**Method 1: File Manager (Recommended)**
1. Login to your Namecheap cPanel
2. Open **File Manager**
3. Navigate to `public_html` directory
4. Delete any existing files (like default index.html)
5. Upload the entire contents of the `dist` folder (not the folder itself)
6. Extract if uploaded as ZIP

**Method 2: FTP Upload**
```bash
# Using FTP client (FileZilla, WinSCP, etc.)
Host: ftp.yourdomain.com
Username: your_cpanel_username
Password: your_cpanel_password
Port: 21

# Upload all files from 'dist' folder to public_html
```

#### 3. Essential cPanel Configuration

**Create .htaccess file** in `public_html`:
```apache
# React Router Support
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security Headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"

# HTTPS Redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache Control for Static Assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

<FilesMatch "\.(html|json)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 hour"
    Header set Cache-Control "public, must-revalidate"
</FilesMatch>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

#### 4. SSL Certificate Setup
1. In cPanel, go to **SSL/TLS**
2. Enable **Let's Encrypt** (free SSL)
3. Force HTTPS redirect in **.htaccess** (already included above)

#### 5. Domain Configuration

**Primary Domain Setup**:
1. Point domain to Namecheap nameservers
2. In cPanel, go to **Subdomains** or **Addon Domains**
3. Add your domain if it's not the primary

**DNS Records** (in Namecheap DNS management):
```
Type: A
Host: @
Value: YOUR_CPANEL_IP (found in cPanel welcome email)
TTL: Automatic

Type: A  
Host: www
Value: YOUR_CPANEL_IP
TTL: Automatic
```

#### 6. Environment Variables Setup

Since static hosting doesn't support server-side environment variables, all config must be built into the app:

**Option 1: Build-time Configuration**
```bash
# Create .env.production file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_key

# Build with production environment
npm run build
```

**Option 2: Runtime Configuration** (Advanced)
Create `config.js` in `public` folder:
```javascript
window.ENV = {
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your_anon_key',
  GOOGLE_MAPS_API_KEY: 'your_maps_key'
};
```

## Alternative Hosting Options

### 1. Netlify (Recommended for React apps)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**netlify.toml** configuration:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### 2. Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**vercel.json** configuration:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/service-worker.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache"
        }
      ]
    }
  ]
}
```

### 3. AWS S3 + CloudFront
```bash
# Install AWS CLI
aws configure

# Sync to S3 bucket
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### 4. GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts
"homepage": "https://yourusername.github.io/repository-name",
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

## Performance Optimization for Hosting

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Optimize build
npm run build -- --mode production
```

### 2. CDN Configuration
```javascript
// vite.config.ts - for CDN assets
export default defineConfig({
  base: 'https://cdn.yourdomain.com/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

### 3. Preloading Critical Resources
```html
<!-- Add to index.html -->
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/critical-styles.css" as="style">
```

## Monitoring and Maintenance

### 1. Uptime Monitoring
- **UptimeRobot**: Free monitoring service
- **Pingdom**: Comprehensive monitoring
- **StatusCake**: Website monitoring

### 2. Error Tracking
```bash
# Install Sentry for error tracking
npm install @sentry/react @sentry/tracing

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production"
});
```

### 3. Analytics Setup
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Backup and Recovery

### 1. Automated Backups
```bash
# Create backup script (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"

# Backup website files
tar -czf $BACKUP_DIR/website_$DATE.tar.gz /path/to/public_html

# Backup database (if using local MySQL)
mysqldump -u username -p database_name > $BACKUP_DIR/database_$DATE.sql
```

### 2. Version Control Integration
```bash
# Setup automatic deployment from Git
git remote add production user@server:/path/to/repo.git

# Deploy script
git push production main
```

## Troubleshooting Common Issues

### 1. Blank Page After Deployment
**Cause**: Incorrect base path or missing files
**Solution**:
```bash
# Check browser console for errors
# Verify all files uploaded correctly
# Check .htaccess configuration
```

### 2. 404 Errors on Refresh
**Cause**: Missing client-side routing configuration
**Solution**: Ensure `.htaccess` has the rewrite rules shown above

### 3. Slow Loading Times
**Solutions**:
- Enable Gzip compression
- Optimize images (WebP format)
- Use CDN for static assets
- Implement code splitting

### 4. API/Database Connection Issues
**Cause**: CORS or network configuration
**Solution**:
```javascript
// Verify Supabase configuration
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
```

## Security Best Practices

### 1. Environment Security
- Never commit API keys to repository
- Use different keys for development/production
- Regularly rotate API keys

### 2. Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://api.supabase.co https://*.supabase.co;
">
```

### 3. Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Security patches
npm audit fix
```

This comprehensive hosting guide covers everything needed to successfully deploy AgroSense Control Hub on Namecheap cPanel or alternative hosting platforms, with optimization and security best practices included.
