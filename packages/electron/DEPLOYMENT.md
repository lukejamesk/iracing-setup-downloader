# P1Doks Downloader - Deployment Guide

This guide explains how to build and deploy the P1Doks Downloader Electron application.

## Prerequisites

- Node.js 18+
- npm 8+
- All dependencies installed (`npm install`)

## Build Commands

### Development Build

```bash
# Build for development (unpacked)
npm run pack:electron
```

### Production Distribution

```bash
# Build for all platforms
npm run dist:electron

# Build for specific platforms
npm run dist:electron:mac    # macOS (DMG + ZIP)
npm run dist:electron:win    # Windows (NSIS + Portable)
npm run dist:electron:linux  # Linux (AppImage + DEB + RPM)
```

## Output Files

Built applications will be created in `packages/electron/release/`:

### macOS

- `P1Doks Downloader-1.0.0.dmg` - Installer
- `P1Doks Downloader-1.0.0-mac.zip` - Portable archive
- `P1Doks Downloader-1.0.0-arm64.dmg` - Apple Silicon installer
- `P1Doks Downloader-1.0.0-arm64-mac.zip` - Apple Silicon portable

### Windows

- `P1Doks Downloader Setup 1.0.0.exe` - NSIS installer
- `P1Doks Downloader 1.0.0.exe` - Portable executable

### Linux

- `P1Doks Downloader-1.0.0.AppImage` - Portable AppImage
- `p1doks-downloader_1.0.0_amd64.deb` - Debian package
- `p1doks-downloader-1.0.0.x86_64.rpm` - RPM package

## Configuration

The build configuration is in `package.json` under the `build` section:

- **App ID**: `com.p1doks.downloader`
- **Product Name**: `P1Doks Downloader`
- **Icons**: Automatically generated from SVG source
- **Output Directory**: `release/`

## Platform-Specific Settings

### macOS

- Category: Utilities
- Targets: DMG and ZIP for both Intel and Apple Silicon
- Icon: `icon.icns`

### Windows

- Targets: NSIS installer and portable executable
- Features: Desktop shortcut, Start menu shortcut
- Icon: `icon.ico`

### Linux

- Category: Utility
- Targets: AppImage, DEB, and RPM packages
- Icon: `icon.png`

## Troubleshooting

### Common Issues

1. **Icon not showing**: Ensure icons are generated with `npm run generate-icons`
2. **Build fails**: Check that all dependencies are installed
3. **Large file size**: This is normal for Electron apps due to Chromium bundling

### Build Requirements

- **macOS builds**: Can only be built on macOS
- **Windows builds**: Can be built on any platform
- **Linux builds**: Can be built on any platform

## Distribution

### Code Signing (Optional)

For production distribution, consider adding code signing:

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name"
    },
    "win": {
      "certificateFile": "path/to/certificate.p12",
      "certificatePassword": "password"
    }
  }
}
```

### Auto-Updater (Future)

Consider adding electron-updater for automatic updates:

```bash
npm install electron-updater
```

## Version Management

Update the version in `package.json` before building:

```json
{
  "version": "1.0.1"
}
```

This will automatically update all built files with the new version number.
