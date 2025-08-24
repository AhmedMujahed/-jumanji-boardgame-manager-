#!/usr/bin/env node

/**
 * Jumanji Favicon Converter Script
 * This script helps convert SVG favicon to different formats
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Jumanji Favicon Converter');
console.log('==============================\n');

// Check if required files exist
const publicDir = path.join(__dirname, 'public');
const requiredFiles = [
    'favicon.svg',
    'favicon-large.svg'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} - Found`);
    } else {
        console.log(`❌ ${file} - Missing`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please ensure all SVG files are in the public directory.');
    process.exit(1);
}

console.log('\n✅ All required files found!');
console.log('\n🚀 Ready to convert your favicon...\n');

console.log('📋 Conversion Instructions:');
console.log('==========================\n');

console.log('1️⃣ Create favicon.ico (32x32):');
console.log('   • Go to: https://favicon.io/favicon-converter/');
console.log('   • Upload: public/favicon.svg');
console.log('   • Download: favicon.ico');
console.log('   • Replace: public/favicon.ico\n');

console.log('2️⃣ Create PNG files:');
console.log('   • Go to: https://convertio.co/svg-png/');
console.log('   • Upload: public/favicon-large.svg');
console.log('   • Create these sizes:');
console.log('     - 192x192 → favicon-192.png');
console.log('     - 512x512 → favicon-512.png');
console.log('     - 180x180 → apple-touch-icon.png');
console.log('   • Replace all placeholder files in public/\n');

console.log('3️⃣ Test your favicon:');
console.log('   • Run: npm run dev');
console.log('   • Open: http://localhost:3001');
console.log('   • Check browser tab for favicon\n');

console.log('🎨 Your favicon design:');
console.log('   • Black background (#000000)');
console.log('   • Green illustrated businessman face');
console.log('   • Professional and distinctive');
console.log('   • Optimized for all sizes\n');

console.log('✨ All configuration is already done!');
console.log('   • app/layout.tsx updated');
console.log('   • manifest.json created');
console.log('   • All favicon links configured\n');

console.log('🚀 Happy converting! Your Jumanji favicon will look amazing! 🎮');
