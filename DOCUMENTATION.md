
# AgroSense Control Hub - Complete Setup & Customization Guide

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Initial Setup](#initial-setup)
3. [Hosting on Namecheap cPanel](#hosting-on-namecheap-cpanel)
4. [Domain Configuration](#domain-configuration)
5. [Platform Customization & Reskinning](#platform-customization--reskinning)
6. [Adding/Removing Features](#addingremoving-features)
7. [Mobile App Export](#mobile-app-export)
8. [Environment Configuration](#environment-configuration)
9. [Troubleshooting](#troubleshooting)
10. [Support & Updates](#support--updates)

## Platform Overview

AgroSense Control Hub is a modern IoT-powered agricultural management platform built with:
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Mobile**: Capacitor (iOS/Android export)
- **Build Tool**: Vite
- **Deployment**: Static files compatible with any hosting

### Key Features
- Real-time IoT sensor monitoring
- Smart irrigation automation
- Weather integration
- Multi-language support (English, French, Arabic)
- Role-based access control
- Mobile-responsive design
- PWA capabilities
- Admin dashboard
- Subscription management

## Initial Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account
- Code editor (VS Code recommended)

### 1. Project Installation
```bash
# Clone the repository
git clone [your-repository-url]
cd agro-sense-control-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Supabase Configuration
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `src/integrations/supabase/client.ts`:
```typescript
const supabaseUrl = "YOUR_SUPABASE_URL"
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"
```

### 3. Environment Variables
Create `.env.local` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## Hosting on Namecheap cPanel

### Step 1: Build the Application
```bash
# Build for production
npm run build
```
This creates a `dist` folder with static files.

### Step 2: Upload to cPanel
1. Log into your Namecheap cPanel
2. Open **File Manager**
3. Navigate to `public_html` directory
4. Upload and extract the contents of the `dist` folder
5. Ensure `index.html` is in the root of `public_html`

### Step 3: Configure cPanel Settings
1. **Create .htaccess file** in `public_html`:
```apache
RewriteEngine On
RewriteBase /

# Handle Angular and React Router
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

2. **Set up SSL Certificate** (if not auto-installed):
   - Go to **SSL/TLS** in cPanel
   - Enable **Let's Encrypt** free SSL

### Step 4: Database Hosting
Since this uses Supabase, your database is already hosted. For local database:
1. Use cPanel **MySQL Databases**
2. Update connection strings in Supabase settings

## Domain Configuration

### Adding Custom Domain to Namecheap

1. **Purchase Domain** (if needed) from Namecheap
2. **DNS Configuration**:
   ```
   Type: A Record
   Host: @
   Value: YOUR_CPANEL_IP_ADDRESS
   TTL: Automatic
   
   Type: CNAME
   Host: www
   Value: yourdomain.com
   TTL: Automatic
   ```

3. **SSL Setup**:
   - Enable **Force HTTPS Redirect** in cPanel
   - Verify SSL certificate installation

### Subdomain Configuration
For subdomains (e.g., app.yourdomain.com):
```
Type: CNAME
Host: app
Value: yourdomain.com
TTL: Automatic
```

## Platform Customization & Reskinning

### 1. Branding & Colors

**Primary Configuration** (`tailwind.config.ts`):
```typescript
theme: {
  extend: {
    colors: {
      // Change primary brand colors
      primary: {
        DEFAULT: "#your-primary-color",
        foreground: "#ffffff",
      },
      // Add custom color scheme
      brand: {
        50: "#f0fdf4",
        500: "#22c55e", // Your main brand color
        600: "#16a34a",
        700: "#15803d",
      }
    }
  }
}
```

**CSS Variables** (`src/index.css`):
```css
:root {
  --primary: 142 70% 49%; /* HSL values */
  --primary-foreground: 355 85% 97%;
  /* Add your custom properties */
  --brand-primary: #your-color;
  --brand-secondary: #your-secondary-color;
}
```

### 2. Logo & Assets Replacement

**Header Logo** (`src/components/layout/Header.tsx`):
```typescript
// Replace the Sprout icon and text
<div className="flex items-center gap-2">
  <img src="/your-logo.svg" alt="Your Brand" className="h-6 w-6" />
  <h2 className="text-lg font-semibold text-foreground">
    Your Platform Name
  </h2>
</div>
```

**Favicon & Meta**:
1. Replace `public/favicon.ico`
2. Update `index.html` meta tags:
```html
<title>Your Platform Name</title>
<meta name="description" content="Your platform description" />
<meta property="og:title" content="Your Platform Name" />
```

### 3. Language & Content Customization

**Landing Page Content** (`src/i18n/locales/en/landing.json`):
```json
{
  "hero": {
    "title": "Your Custom Title",
    "subtitle": "Your custom subtitle and value proposition",
    "getStarted": "Your CTA Text"
  },
  "features": {
    "title": "Your Features Section Title",
    "list": {
      "feature1": {
        "title": "Your Feature Title",
        "description": "Your feature description"
      }
    }
  }
}
```

**Navigation Menu** (`src/components/layout/Sidebar.tsx`):
```typescript
const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Smartphone, label: 'Your Custom Menu', path: '/custom' },
  // Add/remove menu items as needed
];
```

### 4. Theme Customization

**Dark/Light Mode Colors**:
```css
/* Light mode */
.light {
  --background: 0 0% 100%;
  --foreground: 222 84% 5%;
  --primary: your-light-primary;
}

/* Dark mode */
.dark {
  --background: 222 84% 5%;
  --foreground: 210 40% 98%;
  --primary: your-dark-primary;
}
```

## Adding/Removing Features

### Adding New Features

**1. Create New Page**:
```bash
# Create new page component
touch src/pages/YourNewPage.tsx
```

```typescript
// src/pages/YourNewPage.tsx
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const YourNewPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your New Feature</h1>
        {/* Your feature content */}
      </div>
    </DashboardLayout>
  );
};

export default YourNewPage;
```

**2. Add Route** (`src/App.tsx`):
```typescript
// Add to imports
import YourNewPage from '@/pages/YourNewPage';

// Add to routes
<Route path="/your-feature" element={
  <ProtectedRoute>
    <SubscriptionGate>
      <YourNewPage />
    </SubscriptionGate>
  </ProtectedRoute>
} />
```

**3. Add Navigation** (`src/components/layout/Sidebar.tsx`):
```typescript
// Add to menuItems array
{ icon: YourIcon, label: 'Your Feature', path: '/your-feature' },
```

### Removing Features

**1. Remove Route** from `src/App.tsx`
**2. Remove Navigation** from `src/components/layout/Sidebar.tsx`
**3. Delete Page Files** and related components
**4. Remove Database Tables** (if applicable) from Supabase

### Database Schema Modifications

**Adding New Tables**:
```sql
-- In Supabase SQL Editor
CREATE TABLE your_new_table (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE your_new_table ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own data" ON your_new_table
  FOR SELECT USING (auth.uid() = user_id);
```

## Mobile App Export

### Prerequisites for Mobile Development
- **Android**: Android Studio, Java JDK 11+
- **iOS**: macOS with Xcode (Mac only)

### Step 1: Install Capacitor Dependencies
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### Step 2: Initialize Capacitor
```bash
npx cap init "Your App Name" "com.yourcompany.yourapp"
```

### Step 3: Build and Add Platforms
```bash
# Build the web app
npm run build

# Add platforms
npx cap add android
npx cap add ios  # Mac only

# Sync files
npx cap sync
```

### Step 4: Configure App Icons and Splash Screens

**Android** (`android/app/src/main/res/`):
- `mipmap-hdpi/`: 72x72px
- `mipmap-mdpi/`: 48x48px  
- `mipmap-xhdpi/`: 96x96px
- `mipmap-xxhdpi/`: 144x144px
- `mipmap-xxxhdpi/`: 192x192px

**iOS** (`ios/App/App/Assets.xcassets/AppIcon.appiconset/`):
- Various sizes from 20x20 to 1024x1024px

### Step 5: Build and Test
```bash
# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios

# Run on device/emulator
npx cap run android
npx cap run ios
```

### Step 6: App Store Deployment

**Google Play Store**:
1. Generate signed APK/AAB in Android Studio
2. Create Google Play Console account
3. Upload and configure app listing
4. Submit for review

**Apple App Store**:
1. Archive app in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Environment Configuration

### Development Environment
```bash
# .env.development
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

### Production Environment
```bash
# .env.production
VITE_API_URL=https://yourdomain.com
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

### Supabase Environment Setup
1. **Development**: Use Supabase development project
2. **Staging**: Create separate Supabase project
3. **Production**: Use production Supabase project with backups enabled

## Troubleshooting

### Common Issues

**1. Build Errors**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**2. Routing Issues on cPanel**:
- Ensure `.htaccess` file is properly configured
- Check that all routes redirect to `index.html`

**3. Mobile Build Issues**:
```bash
# Clean and rebuild
npx cap clean
npm run build
npx cap sync
```

**4. Database Connection Issues**:
- Verify Supabase URL and keys
- Check RLS policies
- Ensure proper authentication flow

### Performance Optimization

**1. Code Splitting**:
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));
```

**2. Bundle Analysis**:
```bash
npm run build
npx vite-bundle-analyzer dist
```

**3. Image Optimization**:
- Use WebP format when possible
- Implement lazy loading
- Optimize images before upload

## Support & Updates

### Version Control
```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Backup Strategy
1. **Database**: Supabase automatic backups
2. **Code**: Git repository with regular commits  
3. **Assets**: Cloud storage backup

### Update Process
1. **Dependencies**: Regular `npm audit` and updates
2. **Security**: Monitor for vulnerabilities
3. **Features**: Gradual rollout with feature flags

### Customer Support Setup
1. **Documentation**: Maintain this guide updated
2. **Issue Tracking**: GitHub Issues or support system
3. **Changelog**: Document all changes and updates

---

## License & Commercial Use

This platform is ready for commercial distribution on Envato CodeCanyon. Ensure you:

1. **Remove Lovable branding** completely
2. **Add your own license terms**
3. **Include proper attribution** for open-source components
4. **Provide buyer support** documentation
5. **Create installation videos** for better sales

### CodeCanyon Submission Checklist
- [ ] Remove all development/demo content
- [ ] Add comprehensive documentation
- [ ] Include installation guide
- [ ] Test on fresh hosting environment
- [ ] Provide source code with comments
- [ ] Create preview images and demo
- [ ] Write detailed feature list
- [ ] Include licensing information

---

**Need Help?** This documentation covers the complete setup and customization process. For additional support, refer to the troubleshooting section or create detailed issue reports with error logs and environment details.
