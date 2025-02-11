// File: generateProof.js

const circomlibjs = require("circomlibjs");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Load the student records JSON.
// Expected structure:
// {
//   "students": [
//      { "id": "student1", "cgpa": 8.5 },
//      { "id": "student2", "cgpa": 7.2 },
//      ...
//   ]
// }
const { students } = require(`../studentRecords.json`);

/**
 * Build a Merkle tree from an array of leaves.
 * @param {Array<any>} input - Array of leaf values.
 * @param {Function} leafHash - Function to hash a leaf.
 * @param {Function} nodeHash - Function to hash two child nodes.
 * @returns {Object} A Merkle tree object with .getRoot() and .getMerkleProof(index).
 */
async function merkleTree(input, leafHash, nodeHash) {
    const merkle = {
        inputs: [...input], // copy of the input leaves
        leafHash,
        nodeHash,
        depth: Math.log2(input.length),
        nodes: []
    };

    // Compute all levels of the tree.
    // Note: The first level will hash each raw student record.
    function calculateNodes() {
        const levels = [];
        let currentLevel = merkle.inputs.map(merkle.leafHash);
        levels.push(currentLevel);
        while (currentLevel.length > 1) {
            const nextLevel = [];
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                // If odd number of nodes, duplicate the last node.
                const right = (i + 1 < currentLevel.length) ? currentLevel[i + 1] : left;
                nextLevel.push(merkle.nodeHash(left, right));
            }
            levels.push(nextLevel);
            currentLevel = nextLevel;
        }
        return levels.flat();
    }
    
    // Return the root of the tree (last element in the flattened nodes).
    function getRoot() {
        return merkle.nodes[merkle.nodes.length - 1];
    }
    
    /**
     * Generate a Merkle proof for a leaf at the given index.
     * The proof is returned as an object with:
     * - path: an array of 0/1 values indicating left/right.
     * - lemma: an array of hashes: [leaf, ... intermediate hashes, root].
     */
    function getMerkleProof(index) {
        if (index < 0 || index >= merkle.inputs.length) {
            throw new Error("Index out of bounds");
        }
        const path = [];
        const lemma = [];
        let currentIndex = index;
        let width = merkle.inputs.length;
        let offset = 0;
        
        // Start with the leaf hash.
        lemma.push(merkle.nodes[currentIndex]);
        
        while (width > 1) {
            const isLeft = (currentIndex % 2 === 0);
            const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
            // Record the direction: 0 if left, 1 if right.
            path.push(isLeft ? 0 : 1);
            lemma.push(merkle.nodes[offset + siblingIndex]);
            currentIndex = Math.floor(currentIndex / 2);
            offset += width;
            width = Math.ceil(width / 2);
        }
        // Append the computed root.
        lemma.push(getRoot());
        return { path, lemma, calculateRoot: () => {
            return path.reduce((hash, direction, i) => {
                const sibling = lemma[i + 1];
                return direction === 0 ? nodeHash(hash, sibling) : nodeHash(sibling, hash);
            }, lemma[0]);
        }};
    }
    
    merkle.nodes = calculateNodes();
    merkle.getRoot = getRoot;
    merkle.getMerkleProof = getMerkleProof;
    return merkle;
}

/**
 * Hash a student's identifier using SHA-256 and convert to BigInt.
 * (Ensure consistency with the circuit.)
 * @param {string} id - The student identifier.
 * @returns {BigInt} The hash as a BigInt.
 */
function getStudentIDHash(id) {
    if (!id) {
        throw new Error("Invalid student id passed to getStudentIDHash: " + id);
    }
    const hashHex = crypto.createHash("sha256").update(id).digest("hex");
    return BigInt("0x" + hashHex);
}

/**
 * Leaf hash function: Computes Poseidon( studentIDHash, scaledCGPA ).
 * @param {Object} student - The student record { id: string, cgpa: number }.
 * @returns {BigInt} The hash as computed by Poseidon.
 */
async function buildLeafHash(student, poseidon) {
    const studentIDHash = getStudentIDHash(student.id);
    // Scale the CGPA, e.g. 8.50 becomes 850.
    const scaledCGPA = BigInt(Math.floor(student.cgpa * 100));
    return poseidon([studentIDHash, scaledCGPA]);
}

/**
 * Generate the Merkle tree for student records.
 * Each leaf is computed as: Poseidon( studentIDHash, scaledCGPA )
 * by hashing the raw student record.
 */
async function generateStudentMerkleTree() {
    // Build optimized Poseidon.
    const poseidon = await circomlibjs.buildPoseidonOpt();

    // Define the leaf hash function.
    // We wrap buildLeafHash to synchronously return a hash.
    // Since our poseidon hash function is synchronous once built,
    // we can define leafHash as follows:
    const hashStudentLeaf = (student) => {
        // student is an object: { id: string, cgpa: number }
        return poseidon([ getStudentIDHash(student.id), BigInt(Math.floor(student.cgpa * 100)) ]);
    };

    // Define the internal node hash function.
    const hashInternalNode = (left, right) => poseidon([left, right]);

    // Set the tree depth (for example, 10 gives 1024 leaves).
    const treeDepth = 10;
    const maxLeaves = 2 ** treeDepth;
    // Create the leaves array; pad with the last student record if necessary.
    // **Note:** We now pass raw student objects rather than pre-hashed leaves.
    const leaves = Array.from({ length: maxLeaves }, (_, index) => {
        if (index < students.length) {
            console.log(`Processing student ${index + 1}: ${students[index].id}`);
            return students[index];
        } else {
            return students[students.length - 1];
        }
    });

    console.log(`Total students: ${students.length}. Total leaves (with padding): ${leaves.length}.`);

    // Build the Merkle tree.
    const merkleTreeInstance = await merkleTree(leaves, hashStudentLeaf, hashInternalNode);
    const merkleRoot = poseidon.F.toString(merkleTreeInstance.getRoot());
    console.log("Merkle Tree Root:", merkleRoot);
    return { merkleTreeInstance, poseidon };
}

/**
 * Generate a zero-knowledge proof that a given student’s CGPA is above the threshold.
 * The circuit (compiled separately) expects the following inputs:
 *  - Public: merkleRoot, threshold (scaled by 100)
 *  - Private: studentIndex, authPath (array of length treeDepth+2),
 *             studentIDHash, studentCGPA (scaled)
 *
 * @param {string} studentId - The student's identifier (e.g., "student1").
 * @param {number} threshold - The CGPA threshold (e.g., 7.50).
 * @returns {Object} Proof and public signals.
 */
async function generateProof(studentId, threshold) {
    // Look up the student in the records.
    const studentIndex = students.findIndex(student => student.id === studentId);
    if (studentIndex === -1) {
        throw new Error(`Student with id ${studentId} not found.`);
    }
    const studentRecord = students[studentIndex];

    // Build the Merkle tree.
    const { merkleTreeInstance, poseidon } = await generateStudentMerkleTree();
    const merkleRoot = poseidon.F.toString(merkleTreeInstance.getRoot());

    // Compute the studentIDHash and scaled CGPA.
    const studentIDHash = getStudentIDHash(studentRecord.id);
    const scaledCGPA = BigInt(Math.floor(studentRecord.cgpa * 100));
    const thresholdBigInt = BigInt(Math.floor(threshold));

    // Generate the Merkle proof for the student’s leaf.
    const proofData = merkleTreeInstance.getMerkleProof(studentIndex);
    // The circuit expects authPath to have treeDepth+2 elements:
    // [leaf, intermediate nodes..., root]
    const authPath = proofData.lemma.map(x => poseidon.F.toString(x));

    // Prepare the circuit inputs.
    const circuitInputs = {
        // Public inputs.
        merkleRoot: BigInt(merkleRoot),
        threshold: thresholdBigInt,
        // Private inputs.
        studentIndex: BigInt(studentIndex),
        authPath: authPath.map(x => BigInt(x)),
        studentIDHash: studentIDHash,
        studentCGPA: scaledCGPA
    };

    console.log("Circuit Inputs:", circuitInputs);

    // Set the paths to the compiled circuit’s WASM and zkey files.
    // Adjust these paths to your project structure.
    const wasmPath = `../../circuit/setup/circuit.wasm`;
    const zkeyPath = `../../circuit/setup/circuit_final.zkey`;
    console.log("Using WASM Path:", wasmPath);
    console.log("Using ZKey Path:", zkeyPath);

    // Generate the proof using snarkjs.
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuitInputs,
        wasmPath,
        zkeyPath
    );

    console.log("Proof generated successfully.");
    console.log("Public Signals:", publicSignals);
    return { proof, publicSignals };
}

// If this file is run directly, generate a proof for an example student.
if (require.main === module) {
    (async () => {
        try {
            // Example: prove that student "student1" has a CGPA > 7.50.
            const studentId = "student1";
            const threshold = 7.50;
            const { proof, publicSignals } = await generateProof(studentId, threshold);
            console.log("Zero-Knowledge Proof:", JSON.stringify(proof, null, 2));
            console.log("Public Signals:", publicSignals);
        } catch (error) {
            console.error("Error during proof generation:", error);
        }
    })();
}

module.exports = { generateProof, generateStudentMerkleTree };
