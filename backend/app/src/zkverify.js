// zkverify.js
const snarkjs = require("snarkjs");
const fs = require("fs");
const { zkVerifySession, ZkVerifyEvents } = require("zkverifyjs");
const { ethers, id } = require("ethers");
const { Library, CurveType } = require("zkverifyjs");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secrets" });

async function verify(proof, publicSignals) {
  const ZKV_RPC_URL = "wss://testnet-rpc.zkverify.io";
  const ETH_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
  const ETH_ZKVERIFY_CONTRACT_ADDRESS = "0x2C0d06342BA9c7FD7BE164A6eE73beBACeDb6dF4";
  const ETH_SCORE_CONTRACT_ADDRESS = "0xd301Af1BE2852340389607298281b497F7f41fb2";
  const ZKV_SEED_PHRASE = "winner stamp fabric because gallery embody oyster achieve resemble bullet business fee";
  const ETH_SECRET_KEY = "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0";

  try {
    if (publicSignals[1] === "0") {
      throw new Error("THRESHOLD_NOT_MET: Student score is below required threshold of 1400");
    }

    // Initialize core components
    const evmAccount = new ethers.Wallet(ETH_SECRET_KEY).address;
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, null, { polling: true });
    const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);
    const vk = JSON.parse(fs.readFileSync(`/home/nightfury69/Downloads/ZkCertify/backend/circuit/setup/verification_key.json`));


    // Establish zkVerify session
    const session = await zkVerifySession
      .start()
      .Testnet()
      .withAccount(ZKV_SEED_PHRASE);



const {events, transactionResult} = await session.verify()
.groth16(Library.snarkjs, CurveType.bn128).waitForPublishedAttestation()
.execute({proofData: {
    vk: vk,
    proof: proof,
    publicSignals: publicSignals
}});
let attestationId, leafDigest;

// Helper to track event completion
const eventStatus = {
  included: false,
  finalized: false,
  attested: false
};

return new Promise((resolve, reject) => {
  events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
    console.log('Transaction included in block:', eventData);
    attestationId = eventData.attestationId;
    leafDigest = eventData.leafDigest;
    eventStatus.included = true;
  });

  events.on(ZkVerifyEvents.Finalized, (eventData) => {
    console.log('Transaction finalized:', eventData);
    eventStatus.finalized = true;
  });

  // Inside the ZkVerifyEvents.AttestationConfirmed event listener
events.on(ZkVerifyEvents.AttestationConfirmed, async (eventData) => {
  try {
    console.log('Attestation Confirmed:', eventData);
    const proofDetails = await session.poe(attestationId, leafDigest);
    proofDetails.attestationId = eventData.id;
    
    // Write attestation details
    fs.writeFileSync("attestation.json", JSON.stringify(proofDetails, null, 2));
    console.log("proofDetails", proofDetails);
    eventStatus.attested = true;

    // Add contract interaction here
    const attestationData = JSON.parse(fs.readFileSync("attestation.json", "utf8"));
    
    // Define the contract interface
    const ZkCerifyABI = [
      "function ScoreVerify(bytes32 leaf, uint256 _attestationId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) external"
    ];

    // Create contract instance
    const scoreContract = new ethers.Contract(
      ETH_SCORE_CONTRACT_ADDRESS,
      ZkCerifyABI,
      wallet
    );

    const feeData = await provider.getFeeData();

    try {
      // Log the attestation data for debugging
      console.log("Attestation Data:", JSON.stringify(attestationData, null, 2));

      // Format proof array properly
      const formattedProof = attestationData.proof.map(p => 
        ethers.hexlify(p)
      );

      // Get fee data
      const feeData = await provider.getFeeData();

      // Format parameters for contract call
      const params = {
        leaf: ethers.hexlify(attestationData.leaf),
        attestationId: BigInt(attestationData.attestationId),
        proof: formattedProof,
        numberOfLeaves: BigInt(attestationData.numberOfLeaves),
        leafIndex: BigInt(attestationData.leafIndex)
      };

      console.log("Contract call parameters:", params);

      // Execute verification with formatted parameters
      const tx = await scoreContract.ScoreVerify(
        params.leaf,
        params.attestationId,
        params.proof,
        params.numberOfLeaves, 
        params.leafIndex,
        {
          gasLimit: 500000,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        }
      );

      console.log("Transaction sent:", tx.hash);
      const receipt = await tx.wait();
      
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      console.log("Transaction succeeded:", receipt);

      if (eventStatus.included && eventStatus.finalized && eventStatus.attested) {
        resolve(true);
      }
    } catch (error) {
      console.error("Contract interaction failed:", {
        error: error.message,
        reason: error.reason,
        code: error.code,
        data: error.data,
        transaction: error.transaction
      });
      reject(error);
    }
  } catch (error) {
    console.error("Contract interaction failed:", error);
    reject(error);
  }
});

  events.on('error', (error) => {
    console.error("Event error:", error);
    reject(error);
  });

  // Optional timeout
  setTimeout(() => {
    if (!eventStatus.included || !eventStatus.finalized || !eventStatus.attested) {
      reject(new Error('Verification timeout - not all events completed'));
    }
  }, 300000); // 5 minute timeout
}).catch(error => {
  console.error("Verification process failed:", error);
  return false;
});
  } catch (error) {
    console.error("Verification process failed:", error);
    return false;
  } 
}

module.exports = { verify };