const fs = require("fs");
const path = require("path");

// Create a simple PNG icon using a minimal approach
// This creates a basic colored square as a placeholder

const createSimplePngIcon = () => {
  const distDir = path.join(__dirname, "../dist/assets");

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, {recursive: true});
  }

  // Create a simple 256x256 PNG icon
  // This is a very basic approach - in production you'd use sharp or canvas
  const iconSvg = `<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <circle cx="128" cy="128" r="120" fill="url(#bgGradient)" filter="url(#shadow)"/>
    
    <g transform="translate(128, 128)">
      <rect x="-4" y="-40" width="8" height="60" fill="url(#arrowGradient)" rx="4"/>
      <path d="M -20 20 L 0 0 L 20 20 L 12 20 L 12 30 L -12 30 L -12 20 Z" fill="url(#arrowGradient)"/>
      <rect x="-30" y="35" width="60" height="3" fill="url(#arrowGradient)" rx="1.5"/>
    </g>
    
    <text x="128" y="180" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
          text-anchor="middle" fill="white" filter="url(#shadow)">P1</text>
    
    <circle cx="80" cy="80" r="3" fill="white" opacity="0.6"/>
    <circle cx="176" cy="80" r="3" fill="white" opacity="0.6"/>
    <circle cx="80" cy="176" r="3" fill="white" opacity="0.6"/>
    <circle cx="176" cy="176" r="3" fill="white" opacity="0.6"/>
  </svg>`;

  // Write the SVG (which Electron can use)
  fs.writeFileSync(path.join(distDir, "icon.png"), iconSvg);
  fs.writeFileSync(path.join(distDir, "icon.ico"), iconSvg);
  fs.writeFileSync(path.join(distDir, "icon.icns"), iconSvg);

  console.log("Simple PNG icon created successfully!");
  console.log(
    "Note: These are SVG files with PNG extensions. For production, use proper image conversion tools."
  );
};

createSimplePngIcon();
