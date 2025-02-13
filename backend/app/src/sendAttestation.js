const { ethers } = require("ethers");

// Network configurations with Infura
const NETWORKS = {
    ARBITRUM: {
        RPC_URL: "https://sepolia.infura.io/v3/8bc20953225e4a40a8130f1d54c7e5ec",  // Your Infura URL
        CONTRACT_ADDRESS: "0x82C20Bd680dDE5789F6A4420a4131C69CEA7b8EA" // Your Arbitrum contract
    },
    EDUCHAIN: {
        RPC_URL: "https://rpc-testnet.educhain.io", // EDUCHAIN doesn't use Infura
        CONTRACT_ADDRESS: "0x2fe6BF8E5c9A6aC76b91C340f1bC42e3799e2358" // Your EDUCHAIN contract
    }
};

const ETH_SECRET_KEY = "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0";

// Updated ABI to include the mintNFT function
const ZkCerifyABI = [
    "function mintNFT(bytes32 leaf, uint256 _attestationId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index, uint8 network, string memory tokenURI_) external"
];

async function sendAttestation(attestationData, networkChoice) {
    let provider;
    try {
        const networkConfig = NETWORKS[networkChoice];
        if (!networkConfig) {
            throw new Error("Invalid network choice");
        }

        // Initialize provider with connection timeout
        provider = new ethers.JsonRpcProvider(networkConfig.RPC_URL, undefined, {
            timeout: 30000,
            staticNetwork: true  // Prevent automatic network detection
        });

        const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);
        const contract = new ethers.Contract(networkConfig.CONTRACT_ADDRESS, ZkCerifyABI, wallet);

        // Send transaction
        const tx = await contract.mintNFT(
            ethers.hexlify(attestationData.leaf),
            BigInt(attestationData.attestationId),
            attestationData.proof.map(p => ethers.hexlify(p)),
            BigInt(attestationData.numberOfLeaves),
            BigInt(attestationData.leafIndex),
            networkChoice === 'EDUCHAIN' ? 0 : 1,
            "ipfs://metadata"  // Replace with actual metadata URI
        );

        console.log(`Transaction sent on ${networkChoice}:`, tx.hash);
        const receipt = await tx.wait();
        console.log("Transaction confirmed in block:", receipt.blockNumber);

        return receipt;
    } catch (error) {
        console.error(`Failed to send attestation on ${networkChoice}:`, error);
        throw error;
    } finally {
        // Cleanup provider connection
        if (provider) {
            await provider.destroy();
        }
    }
}

module.exports = { sendAttestation };