const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const generateIcons = async () => {
  const srcIcon = path.join(__dirname, "../src/assets/icon.svg");
  const distDir = path.join(__dirname, "../dist/assets");

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, {recursive: true});
  }

  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(srcIcon);

    // Create PNG versions for different sizes
    const sizes = [16, 32, 64, 128, 256, 512];

    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(distDir, `icon-${size}x${size}.png`));
    }

    // Create the main PNG icon (256x256)
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(distDir, "icon.png"));

    // Create ICO file for Windows
    await sharp(svgBuffer)
      .resize(256, 256)
      .png()
      .toFile(path.join(distDir, "icon.ico"));

    // Create ICNS file for macOS (512x512)
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(distDir, "icon.icns"));

    // Copy original SVG
    fs.copyFileSync(srcIcon, path.join(distDir, "icon.svg"));

    console.log("Icon files generated successfully!");
    console.log(
      "Created:",
      sizes.map((s) => `${s}x${s}.png`).join(", "),
      "ico, icns"
    );
    console.log("All icons are now proper PNG/ICO/ICNS files!");
  } catch (error) {
    console.error("Error generating icons:", error);
    // Fallback to simple copy
    fs.copyFileSync(srcIcon, path.join(distDir, "icon.svg"));
    fs.copyFileSync(srcIcon, path.join(distDir, "icon.png"));
    console.log("Fallback: Copied SVG files as PNG");
  }
};

generateIcons();
