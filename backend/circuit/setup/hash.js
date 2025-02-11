// To run this script, follow these steps:
// 1. Ensure you have Node.js installed on your machine.
// 2. Install the 'ethers' library by running: npm install ethers
// 3. Place your 'verification_key.json' file in the same directory as this script.
// 4. Run the script using the command: node hash.js

const fs = require("fs");
const { ethers } = require("ethers");

function getVKHash() {
  const verificationKey = JSON.parse(fs.readFileSync("verification_key.json"));
  const vkHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(verificationKey))
  );
  return vkHash;
}

console.log("vkHash:", getVKHash());
module.exports = { getVKHash };