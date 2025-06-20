
# Mobile App Setup Guide

This guide will help you export your AgroSense Control Hub app to Android and iOS platforms using Capacitor.

## Prerequisites

### For Android Development:
- Android Studio installed
- Android SDK and build tools
- Java Development Kit (JDK) 11 or higher

### For iOS Development:
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer Account (for distribution)

## Setup Instructions

### 1. Initial Setup (One-time)

Export your project to GitHub and clone it locally:
```bash
git clone [your-github-repo-url]
cd agro-sense-control-hub
npm install
```

### 2. Add Mobile Platforms

Add Android platform:
```bash
npx cap add android
```

Add iOS platform (Mac only):
```bash
npx cap add ios
```

### 3. Build and Sync

Build the web app and sync with mobile platforms:
```bash
npm run mobile:build
```

Or manually:
```bash
npm run build
npx cap sync
```

### 4. Development and Testing

#### Android Development:
```bash
# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

#### iOS Development (Mac only):
```bash
# Open in Xcode
npx cap open ios

# Or run directly
npx cap run ios
```

## Generating Release Builds

### Android APK/AAB:

1. Open Android Studio: `npx cap open android`
2. Go to Build → Generate Signed Bundle/APK
3. Choose APK or AAB format
4. Configure signing key
5. Select release build variant
6. Build and locate the generated file in `android/app/build/outputs/`

### iOS IPA:

1. Open Xcode: `npx cap open ios`
2. Select your development team
3. Configure app signing
4. Product → Archive
5. Distribute App → Export for distribution

## Configuration

### App Icons and Splash Screens:
- Place app icons in `android/app/src/main/res/` (Android)
- Place app icons in `ios/App/App/Assets.xcassets/` (iOS)
- Configure splash screens in respective platform folders

### Permissions:
- Android: Edit `android/app/src/main/AndroidManifest.xml`
- iOS: Edit `ios/App/App/Info.plist`

## Troubleshooting

### Common Issues:
1. **Build errors**: Ensure all dependencies are installed
2. **Sync issues**: Try `npx cap sync --force`
3. **Platform not found**: Run `npx cap add [platform]` first
4. **Permission issues**: Check platform-specific permission files

### Useful Commands:
```bash
# Check Capacitor setup
npx cap doctor

# Update platforms
npx cap update

# Clean and rebuild
npx cap sync --force
```

## Production Deployment

### Google Play Store (Android):
1. Generate signed AAB file
2. Upload to Google Play Console
3. Complete app listing and review process

### Apple App Store (iOS):
1. Generate IPA file via Xcode
2. Upload via App Store Connect
3. Complete app review process

## Hot Reload for Development

The app is configured with hot reload pointing to your Lovable preview URL. This allows you to see changes instantly while developing in Lovable.

For local development, update the `server.url` in `capacitor.config.ts` to your local development server.
