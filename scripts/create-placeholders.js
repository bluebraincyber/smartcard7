const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create cover placeholder
function createCoverPlaceholder() {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Text
  ctx.fillStyle = '#999999';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Capa da Loja', width / 2, height / 2);
  
  // Border
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
  
  // Save to file
  const buffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
  fs.writeFileSync(path.join(uploadsDir, 'placeholder-cover.jpg'), buffer);
  console.log('Created placeholder-cover.jpg');
}

// Create profile placeholder
function createProfilePlaceholder() {
  const size = 400;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, size, size);
  
  // Circle
  ctx.fillStyle = '#b0b0b0';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LOGO', size / 2, size / 2);
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(uploadsDir, 'placeholder-logo.png'), buffer);
  console.log('Created placeholder-logo.png');
}

// Run both functions
createCoverPlaceholder();
createProfilePlaceholder();

console.log('Placeholder images created successfully!');
