# App Icons

This directory contains the app icons for the P1Doks Downloader Electron application.

## Files

- `icon.svg` - Main app icon in SVG format
  - Features a blue gradient background
  - Download arrow with white gradient
  - "P1" text at the bottom
  - Decorative accent dots
  - Drop shadow effects

## Usage

The icon is automatically used by the Electron app in:

- Window title bar
- Taskbar/dock
- App switcher
- File associations

## Generation

Icons are generated during the build process using the `generate-icons.js` script.

## Production Notes

For production builds, consider:

- Converting SVG to PNG/ICO formats for better compatibility
- Creating multiple sizes (16x16, 32x32, 64x64, 128x128, 256x256)
- Using tools like `sharp`, `canvas`, or `imagemagick` for conversion
- Using `electron-builder` for proper icon packaging
