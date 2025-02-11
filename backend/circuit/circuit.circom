pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";  // for comparator

// --- Helper: ConditionalSelector ---
// Selects between two inputs based on a boolean selector.
template ConditionalSelector() {
    signal input selector; // Must be 0 or 1
    signal input input0;
    signal input input1;
    signal output selectedValue;

    // Enforce boolean constraint
    selector * (selector - 1) === 0;

    // Create intermediate signals for quadratic constraints
    signal sel_times_in1;
    signal one_minus_sel_times_in0;

    // Break down the computation into quadratic steps
    sel_times_in1 <== selector * input1;
    one_minus_sel_times_in0 <== (1 - selector) * input0;
    
 // Final addition is linear
    selectedValue <== sel_times_in1 + one_minus_sel_times_in0;
}   
// --- Helper: PoseidonHash2 ---
// Computes Poseidon( in0, in1 ).
template PoseidonHash2() {
    signal input in0;
    signal input in1;
    signal output out;
    component hasher = Poseidon(2);
    hasher.inputs[0] <== in0;
    hasher.inputs[1] <== in1;
    out <== hasher.out;
}

// --- MerkleProof ---
// Given a leaf index and an authentication path, this component recomputes
// the Merkle root. The authPath array is assumed to have treeDepth+2 elements:
// [ leaf, intermediate hashes..., providedRoot ].
template MerkleProof(treeDepth) {
    signal input studentIndex;       // Leaf index.
    signal input authPath[treeDepth + 2]; // [Leaf, intermediate nodes..., Root].

    // Convert the leaf index to bits.
    component indexBits = Num2Bits(treeDepth);
    indexBits.in <== studentIndex;
    for (var i = 0; i < treeDepth; i++) {
        indexBits.out[i] * (indexBits.out[i] - 1) === 0;
    }

    // Compute the hash chain.
    signal hash_chain[treeDepth + 1];
    hash_chain[0] <== authPath[0];  // Start with the provided leaf.
    
    component hashers[treeDepth];
    component muxLeft[treeDepth];
    component muxRight[treeDepth];

    for (var i = 0; i < treeDepth; i++) {
        hashers[i] = PoseidonHash2();

        // Select left input:
        muxLeft[i] = ConditionalSelector();
        muxLeft[i].selector <== indexBits.out[i];
        muxLeft[i].input0 <== hash_chain[i];
        muxLeft[i].input1 <== authPath[i + 1];
        hashers[i].in0 <== muxLeft[i].selectedValue;

        // Select right input:
        muxRight[i] = ConditionalSelector();
        muxRight[i].selector <== indexBits.out[i];
        muxRight[i].input0 <== authPath[i + 1];
        muxRight[i].input1 <== hash_chain[i];
        hashers[i].in1 <== muxRight[i].selectedValue;

        // Compute the hash for the next level.
        hash_chain[i + 1] <== hashers[i].out;
    }

    // Enforce that the computed root equals the provided root.
    hash_chain[treeDepth] === authPath[treeDepth + 1];
}

// --- CGPACircuit ---
// This circuit proves that a student’s record is in the Merkle tree
// and that their CGPA is greater than a provided threshold.
// 
// Public Inputs:
//    merkleRoot - the root of the Merkle tree.
//    threshold  - the CGPA threshold (e.g. 750 for 7.50).
//
// Private Inputs:
//    studentIndex - the index of the student’s leaf in the tree.
//    authPath     - the Merkle proof path [leaf, ..., root].
//    studentIDHash - a (numeric) hash of the student’s ID.
//    studentCGPA   - the student’s CGPA as an integer (e.g. 850 for 8.50).
//
// Output:
//    result - 1 if studentCGPA > threshold, else 0.
template CGPACircuit(treeDepth, cgpaBits) {
    // Public inputs.
    signal input merkleRoot;
    signal input threshold;

    // Private inputs.
    signal input studentIndex;
    signal input authPath[treeDepth + 2];
    signal input studentIDHash;
    signal input studentCGPA;

    // Recompute the leaf hash from the student’s ID hash and CGPA.
    component leafHasher = PoseidonHash2();
    leafHasher.in0 <== studentIDHash;
    leafHasher.in1 <== studentCGPA;
    // The computed leaf must match the first element of the authentication path.
    leafHasher.out === authPath[0];

    // Verify the Merkle proof.
    component merkleProof = MerkleProof(treeDepth);
    merkleProof.studentIndex <== studentIndex;
    merkleProof.authPath <== authPath;
    // Also ensure that the provided root in the authPath matches merkleRoot.
    authPath[treeDepth + 1] === merkleRoot;

    // Compare studentCGPA with threshold.
    // The LessThan component outputs 1 if in[0] < in[1].
    // Here, cmp.out will be 1 if threshold < studentCGPA.
    component cmp = LessThan(cgpaBits);
    cmp.in[0] <== threshold;
    cmp.in[1] <== studentCGPA;

    // Output the yes/no result.
    signal output result;
    result <== cmp.out;
}

// --- Main Component ---
// In this example, we fix the Merkle tree depth to 10 and assume CGPA is represented
// in 16 bits (adjust cgpaBits as needed).
component main { public [merkleRoot, threshold] } = CGPACircuit(10, 16);
