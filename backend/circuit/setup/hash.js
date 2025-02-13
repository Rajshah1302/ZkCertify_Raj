// circuit/setup/hash.js

const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

function getVKHash() {
  try {
    // Use path.join for cross-platform compatibility
    const vkPath = path.join(__dirname, 'verification_key.json');
    
    // Check if file exists
    if (!fs.existsSync(vkPath)) {
      throw new Error(`verification_key.json not found at ${vkPath}`);
    }

    const vk = JSON.parse(fs.readFileSync(vkPath));
    return ethers.id(JSON.stringify(vk));
  } catch (error) {
    console.error('Error reading verification key:', error.message);
    process.exit(1);
  }
}

console.log('Verification Key Hash:', getVKHash());