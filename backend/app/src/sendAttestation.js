const { ethers } = require("ethers");

// Replace with your Infura endpoint and your secret key (ideally via environment variables)
const INFURA_URL = process.env.INFURA_URL || "https://sepolia.infura.io/v3/8bc20953225e4a40a8130f1d54c7e5ec";
const ETH_SECRET_KEY = "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0";
const ETH_SCORE_CONTRACT_ADDRESS = "0xd301Af1BE2852340389607298281b497F7f41fb2";

// Define the ABI fragment for the ScoreVerify function
const ZkCerifyABI = [
  "function ScoreVerify(bytes32 leaf, uint256 _attestationId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) external"
];

async function sendAttestation(attestationData) {
  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(INFURA_URL);
  const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);

  // Create a contract instance
  const contract = new ethers.Contract(ETH_SCORE_CONTRACT_ADDRESS, ZkCerifyABI, wallet);

  const formattedProof = attestationData.proof.map(p => ethers.hexlify(p));
  const leaf = ethers.hexlify(attestationData.leaf);
  const attestationId = BigInt(attestationData.attestationId);
  const numberOfLeaves = BigInt(attestationData.numberOfLeaves);
  const leafIndex = BigInt(attestationData.leafIndex);

  try {
    // Send the transaction to call ScoreVerify with the formatted parameters.
    const tx = await contract.ScoreVerify(
      leaf,
      attestationId,
      formattedProof,
      numberOfLeaves,
      leafIndex,
      {
        gasLimit: 500000, // Adjust gas limit as needed.
      }
    );
    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    return receipt;
  } catch (error) {
    console.error("Error sending attestation:", error);
    throw error;
  }
}
module.exports = { sendAttestation };