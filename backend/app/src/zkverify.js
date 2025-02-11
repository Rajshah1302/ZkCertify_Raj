// zkverify.js
const snarkjs = require("snarkjs");
const fs = require("fs");
const { zkVerifySession, ZkVerifyEvents } = require("zkverifyjs");
const { ethers } = require("ethers");
const circomlibjs = require("circomlibjs");
const { Library, CurveType } = require("zkverifyjs");

require("dotenv").config({ path: ".env" });
require("dotenv").config({ path: ".env.secrets" });
async function verify(proof, publicSignals) {
  const ZKV_RPC_URL = "wss://testnet-rpc.zkverify.io";
  const ETH_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

  const ETH_ZKVERIFY_CONTRACT_ADDRESS =
    "0x2C0d06342BA9c7FD7BE164A6eE73beBACeDb6dF4";
  const ETH_CGPA_CONTRACT_ADDRESS =
    "0x2bf9C83a5d5Dc713235D4D8E47fD7D1A58c01de3";
  const ZKV_SEED_PHRASE =
    "winner stamp fabric because gallery embody oyster achieve resemble bullet business fee";

  const ETH_SECRET_KEY =
    "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0";
  try {
    console.log("Entered");
    console.log("ZKV_RPC_URL:", ZKV_RPC_URL);
    console.log("ZKV_SEED_PHRASE:", ZKV_SEED_PHRASE);
    console.log("ETH_RPC_URL:", ETH_RPC_URL);
    console.log("ETH_SECRET_KEY:", ETH_SECRET_KEY);
    console.log(
      "ETH_ZKVERIFY_CONTRACT_ADDRESS:",
      ETH_ZKVERIFY_CONTRACT_ADDRESS
    );
    const evmAccount = new ethers.Wallet(
      "0xc5bbc52585e112afddbd3cdc271e8c87c4a959e4a24994d7f9438a859edea9d0"
    ).address;

    console.log("EVM Account:", evmAccount);

    console.log("-------------- Public Signals ------------------");
    console.log(publicSignals);
    console.log("---------------- Proof ----------------");
    console.log(proof);

    const vk = JSON.parse(
      fs.readFileSync(`../../circuit/setup/verification_key.json`)
    );

    // Establish zkVerify session.
    const session = await zkVerifySession
      .start()
      .Custom(ZKV_RPC_URL)
      .withAccount(ZKV_SEED_PHRASE);
    // Submit proof for verification.
    const { events, transactionResult } = await session
      .verify()
      .groth16(Library.snarkjs, CurveType.bn128)
      .waitForPublishedAttestation()
      .execute({
        proofData: {
          vk,
          proof,
          publicSignals,
        },
      });

    // Event handlers.
    events.on(ZkVerifyEvents.IncludedInBlock, ({ txHash }) => {
      console.log(`Transaction accepted in zkVerify, tx-hash: ${txHash}`);
    });

    events.on(ZkVerifyEvents.Finalized, ({ blockHash }) => {
      console.log(
        `Transaction finalized in zkVerify, block-hash: ${blockHash}`
      );
    });

    events.on("error", (error) => {
      console.error("Error during verification:", error);
    });

    try {
      // Await the final transaction result.
      const transactionInfo = await transactionResult;
      console.log("Transaction completed successfully:", transactionInfo);
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      // Close the session when done.
    }

    // Get transaction result.
    const { attestationId, leafDigest } = await transactionResult;
    console.log(`Attestation published on zkVerify`);
    console.log(`\tattestationId: ${attestationId}`);
    console.log(`\tleafDigest: ${leafDigest}`);
    console.log("LeafDigest type:", typeof leafDigest);

    // IMPORTANT: Retrieve proof details before closing the session.
    const proofDetails = await session.poe(attestationId, leafDigest);
    const { proof: merkleProof, numberOfLeaves, leafIndex } = proofDetails;
    // Expecting publicSignals as [result, root, threshold].
    const [result, root, threshold] = publicSignals;
    console.log(`\tresult ${result}`);
    console.log(`\troot ${root}`);
    console.log(`\tthreshold ${threshold}`);

    console.log(`Merkle proof details`);
    console.log(`\tmerkleProof: ${merkleProof}`);
    console.log("Is Array:", Array.isArray(merkleProof));
    console.log("Length:", merkleProof?.length);
    console.log(`\tnumberOfLeaves: ${numberOfLeaves}`);
    console.log(`\tleafIndex: ${leafIndex}`);

    // Now you may safely close the session.
    await session.close();
    // Setup EVM provider and wallet.
    const provider = new ethers.JsonRpcProvider(ETH_RPC_URL, null, {
      polling: true,
    });
    const wallet = new ethers.Wallet(ETH_SECRET_KEY, provider);

    // Contract ABIs.
    const abiZkvContract = [
      "event AttestationPosted(uint256 indexed attestationId, bytes32 indexed root)",
    ];
    // Updated ABI for CGPA contract (without verificationCommitment)
    const abiCGPAContract = [
      // Constructor.
      "constructor(address _zkvContract, bytes32 _vkHash, uint256 _cgpaThreshold)",

      // Updated main verification function.
      "function verifyCGPA(uint256 attestationId, uint256 root, uint256 cgpa, bytes32[] merklePath, uint256 leafCount, uint256 index)",

      // Events.
      "event CGPAVerified(address indexed student)",
      "event ThresholdMet()",

      // View functions.
      "function PROVING_SYSTEM_ID() view returns (bytes32)",
      "function cgpaThreshold() view returns (uint256)",
      "function vkHash() view returns (bytes32)",
      "function zkvContract() view returns (address)",
      "function hasVerifiedCGPA(address) view returns (bool)",
      "function usedProofs(uint256) view returns (bool)",
    ];

    const zkvContract = new ethers.Contract(
      ETH_ZKVERIFY_CONTRACT_ADDRESS,
      abiZkvContract,
      provider
    );
    console.log("ZKV Contract:", zkvContract);
    const cgpaContract = new ethers.Contract(
      ETH_CGPA_CONTRACT_ADDRESS,
      abiCGPAContract,
      wallet
    );
    console.log("CGPA Contract:", cgpaContract);

    const filterAttestationsById = zkvContract.filters.AttestationPosted(
      attestationId,
      null
    );
    console.log("Filter:", filterAttestationsById);

    events.on(ZkVerifyEvents.IncludedInBlock, (eventData) => {
      console.log("Transaction included in block:", eventData);
    });

    events.on(ZkVerifyEvents.Finalized, (eventData) => {
      console.log("Transaction finalized:", eventData);
    });

    events.on("error", (error) => {
      console.error("An error occurred during the transaction:", error);
    });

    return new Promise(async (resolve, reject) => {
      console.log("Entered Promise");
      // Listen for the attestation event from zkVerify.
      zkvContract.once(filterAttestationsById, async (_id, _root) => {
        try {
          console.log("Attestation event received from zkVerify");
          // Call the contract's verifyCGPA function.
          const txResponse = await cgpaContract.verifyCGPA(
            attestationId,
            root,
            merkleProof,
            numberOfLeaves,
            leafIndex
          );
          console.log("Transaction sent to EVM");
          const receipt = await txResponse.wait();
          console.log(
            `Transaction sent to EVM, tx-hash ${receipt.transactionHash}`
          );
        } catch (txError) {
          console.error("Error in verifyCGPA:", txError);
          reject(txError);
        }
      });

      const filterCGPAEventsByCaller =
        cgpaContract.filters.CGPAVerified(evmAccount);
      cgpaContract.once(filterCGPAEventsByCaller, async () => {
        console.log("CGPA verification successful!");
        resolve(true);
      });
    });
  } catch (error) {
    console.error("Verification failed:", error);
    return false;
  }
}

module.exports = { verify };
