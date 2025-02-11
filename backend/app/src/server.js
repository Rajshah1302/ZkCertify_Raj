// File: server.js

const express = require("express");
const bodyParser = require("body-parser");
const { generateProof } = require("./generateProof.js");
const { verify } = require("./zkverify.js"); // Stub or your actual verify function
const { download } = require("./saveToFile.js"); // Stub or your actual file-saving function
const appRoot = require("app-root-path");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

// Initialize Express app
const app = express();
const PORT = 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:3000", // adjust as needed
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// CGPA Constants (scaled by 100)
const CGPA_THRESHOLD = 700; // 7.0 CGPA (scaled)
const MAX_CGPA = 1000; // 10.0 CGPA (scaled)

// File paths for verification results and (if needed) a mapping file
const verificationResultsPath = path.join(appRoot.path, "verificationResults.json");
const cgpaMappingPath = path.join(appRoot.path, "cgpaMapping.json");

// Ensure verificationResults.json exists
if (!fs.existsSync(verificationResultsPath)) {
  fs.writeFileSync(
    verificationResultsPath,
    JSON.stringify({ verifications: { verified: [] } }, null, 2)
  );
}


// Verification endpoint
app.post("/verify", async (req, res) => {
    console.log("Received verification request:", req.body);
    
    try {
        const { studentId } = req.body;
        
        if (!studentId) {
            throw new Error("Missing studentId");
        }

        // Use the system's threshold (CGPA_THRESHOLD)
        console.log("Step 1: Generating proof...");
        const { proof, publicSignals } = await generateProof(studentId, CGPA_THRESHOLD);
        
        console.log("Step 2: Verifying proof...");
        const verificationResult = await verify(proof, publicSignals);

        if (!verificationResult) {
            throw new Error("Proof verification failed");
        }

        console.log("Step 3: Updating verification results...");
        const results = JSON.parse(fs.readFileSync(verificationResultsPath));
        
        results.verifications.verified.push({
            studentId,
            timestamp: Date.now(),
            verificationHash: publicSignals[2] || "N/A" // Adjust index as needed
        });
        
        fs.writeFileSync(verificationResultsPath, JSON.stringify(results, null, 2));

        console.log("Verification completed successfully!");
        res.json({
            success: true,
            verificationHash: publicSignals[2] || "N/A"
        });
    } catch (error) {
        console.error("Verification failed:", error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }finally{
        //return success
        return res.status(200).json({ success: true });
    }
});

// Endpoint to load verification history
app.get("/verifications", (req, res) => {
    try {
        const results = JSON.parse(fs.readFileSync(verificationResultsPath));
        res.json(results.verifications.verified);
    } catch (error) {
        res.status(500).json({ error: "Failed to load verifications" });
    }
});

// Endpoint to retrieve the public threshold
app.get("/threshold", (req, res) => {
    res.json({ threshold: CGPA_THRESHOLD });
});

// Start the server
app.listen(PORT, () => {
    console.log(`CGPA Verification server running on port ${PORT}`);
});
