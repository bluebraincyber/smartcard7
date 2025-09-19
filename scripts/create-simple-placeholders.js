const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Create a simple SVG for the cover
const coverSvg = `
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0" />
  <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#dddddd" stroke-width="2" />
  <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" fill="#999999" text-anchor="middle" dominant-baseline="middle">Capa da Loja</text>
</svg>
`;

// Create a simple SVG for the logo
const logoSvg = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#e0e0e0" />
  <circle cx="200" cy="200" r="133" fill="#b0b0b0" />
  <text x="50%" y="50%" font-family="Arial" font-size="80" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">LOGO</text>
</svg>
`;

// Write the files
fs.writeFileSync(path.join(imagesDir, 'placeholder-cover.svg'), coverSvg.trim());
fs.writeFileSync(path.join(imagesDir, 'placeholder-logo.svg'), logoSvg.trim());

console.log('Placeholder SVGs created successfully!');
