/**
 * Vendor bundler - Downloads libraries from CDN and creates /vendor directory
 * Run with: node vendor-builder.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const vendorDir = path.join(__dirname, 'vendor');

// Create vendor directory
if (!fs.existsSync(vendorDir)) {
  fs.mkdirSync(vendorDir, { recursive: true });
  console.log(`Created vendor directory: ${vendorDir}`);
}

// Libraries to download
const libraries = [
  {
    name: 'aframe 1.4.0',
    url: 'https://aframe.io/releases/1.4.0/aframe.min.js',
    filename: 'aframe.min.js'
  },
  {
    name: 'aframe 1.4.2',
    url: 'https://aframe.io/releases/1.4.2/aframe.min.js',
    filename: 'aframe-1.4.2.min.js'
  },
  {
    name: 'aframe 1.5.0',
    url: 'https://aframe.io/releases/1.5.0/aframe.min.js',
    filename: 'aframe-1.5.0.min.js'
  },
  {
    name: 'three.js r128',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    filename: 'three.min.js'
  },
  {
    name: 'tween.js',
    url: 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js',
    filename: 'tween.min.js'
  },
  {
    name: 'tailwindcss',
    url: 'https://cdn.tailwindcss.com/3.4.1',
    filename: 'tailwindcss.min.js'
  }
];

/**
 * Downloads a file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete file if error
      reject(err);
    });
  });
}

/**
 * Downloads all libraries
 */
async function bundleLibraries() {
  console.log('Bundling libraries into /vendor directory...\n');
  
  for (const lib of libraries) {
    const destPath = path.join(vendorDir, lib.filename);
    
    try {
      console.log(`Downloading ${lib.name}...`);
      await downloadFile(lib.url, destPath);
      const stats = fs.statSync(destPath);
      console.log(`✓ ${lib.name} - ${(stats.size / 1024).toFixed(2)}KB\n`);
    } catch (error) {
      console.error(`✗ Failed to download ${lib.name}:`, error.message);
      console.error(`  URL: ${lib.url}\n`);
    }
  }
  
  console.log('Bundling complete!');
  console.log(`Files available in: ${path.relative(process.cwd(), vendorDir)}/`);
}

bundleLibraries().catch(console.error);
