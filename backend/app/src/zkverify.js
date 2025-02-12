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
  const ETH_SCORE_CONTRACT_ADDRESS = "0x74454b0FfEC66F3796F0bCA41d41112F0126643e";
  const ZKV_SEED_PHRASE = "winner stamp fabric because gallery embody oyster achieve resemble bullet business fee";
  const ETH_SECRET_KEY = "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0";

  try {
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

  events.on(ZkVerifyEvents.AttestationConfirmed, async(eventData) => {
    try {
      console.log('Attestation Confirmed', eventData);
      const proofDetails = await session.poe(attestationId, leafDigest);
      proofDetails.attestationId = eventData.id;
      fs.writeFileSync("attestation.json", JSON.stringify(proofDetails, null, 2));
      console.log("proofDetails", proofDetails);
      eventStatus.attested = true;

      // Check if all events are complete
      if (eventStatus.included && eventStatus.finalized && eventStatus.attested) {
        resolve(true);
      }
    } catch (error) {
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