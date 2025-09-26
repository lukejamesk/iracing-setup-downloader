const fs = require("fs");
const path = require("path");

// Create a simple base64 encoded PNG icon (16x16, 32x32, 64x64, 128x128, 256x256)
// This is a minimal approach - in production you'd use a proper image processing library

const createSimpleIcon = () => {
  // For now, we'll just copy the SVG and let Electron handle the conversion
  // In a real project, you'd use sharp, canvas, or imagemagick to create proper PNG/ICO files

  const srcIcon = path.join(__dirname, "../src/assets/icon.svg");
  const distDir = path.join(__dirname, "../dist/assets");

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, {recursive: true});
  }

  // Copy SVG icon
  fs.copyFileSync(srcIcon, path.join(distDir, "icon.svg"));

  console.log("Simple icon created successfully!");
  console.log(
    "Note: For production builds, consider using electron-builder with proper icon conversion"
  );
};

createSimpleIcon();
