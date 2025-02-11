const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateProof } = require("../src/generateProof");
const { verify } = require("../src/zkverify");
const router = express.Router();

const CGPA_THRESHOLD = 700;
const verificationResultsPath = "../verificationResults.json";

if (!fs.existsSync(verificationResultsPath)) {
  fs.writeFileSync(
    verificationResultsPath,
    JSON.stringify({ verifications: { verified: [] } }, null, 2)
  );
}

router.post("/", async (req, res) => {
  console.log("Received verification request:", req.body);

  try {
    const { studentId } = req.body;
    if (!studentId) throw new Error("Missing studentId");

    console.log("Step 1: Generating proof...");
    const { proof, publicSignals } = await generateProof(
      studentId,
      CGPA_THRESHOLD
    );

    console.log("Step 2: Verifying proof...");
    const verificationResult = await verify(proof, publicSignals);
    if (!verificationResult) throw new Error("Proof verification failed");

    console.log("Step 3: Updating verification results...");
    const results = JSON.parse(fs.readFileSync(verificationResultsPath));

    results.verifications.verified.push({
      studentId,
      timestamp: Date.now(),
      verificationHash: publicSignals[2] || "N/A",
    });

    fs.writeFileSync(verificationResultsPath, JSON.stringify(results, null, 2));

    console.log("Verification completed successfully!");
    res.json({ success: true, verificationHash: publicSignals[2] || "N/A" });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
