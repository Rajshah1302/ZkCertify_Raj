pragma circom 2.1.5;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";  // for comparator

// --- Helper: ConditionalSelector ---
template ConditionalSelector() {
    signal input selector; // Must be 0 or 1
    signal input input0;
    signal input input1;
    signal output selectedValue;
    selector * (selector - 1) === 0;
    signal sel_times_in1;
    signal one_minus_sel_times_in0;
    sel_times_in1 <== selector * input1;
    one_minus_sel_times_in0 <== (1 - selector) * input0;
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
template MerkleProof(treeDepth) {
    signal input studentIndex;       // Leaf index.
    signal input authPath[treeDepth + 2]; // [Leaf, intermediate nodes..., Root].
    component indexBits = Num2Bits(treeDepth);
    indexBits.in <== studentIndex;
    for (var i = 0; i < treeDepth; i++) {
        indexBits.out[i] * (indexBits.out[i] - 1) === 0;
    }
    signal hash_chain[treeDepth + 1];
    hash_chain[0] <== authPath[0];  // Start with the provided leaf.
    component hashers[treeDepth];
    component muxLeft[treeDepth];
    component muxRight[treeDepth];
    for (var i = 0; i < treeDepth; i++) {
        hashers[i] = PoseidonHash2();
        muxLeft[i] = ConditionalSelector();
        muxLeft[i].selector <== indexBits.out[i];
        muxLeft[i].input0 <== hash_chain[i];
        muxLeft[i].input1 <== authPath[i + 1];
        hashers[i].in0 <== muxLeft[i].selectedValue;
        muxRight[i] = ConditionalSelector();
        muxRight[i].selector <== indexBits.out[i];
        muxRight[i].input0 <== authPath[i + 1];
        muxRight[i].input1 <== hash_chain[i];
        hashers[i].in1 <== muxRight[i].selectedValue;
        hash_chain[i + 1] <== hashers[i].out;
    }
    hash_chain[treeDepth] === authPath[treeDepth + 1];
}

// --- CombinedScoreCircuit ---
// This circuit proves that a candidate’s combined score (from CGPA and tech test)
// exceeds a given threshold.
// The combined score is computed as:
//   finalScore = studentCGPA + (studentTestScore * weight)
// where weight is a constant (set to 10 here).
template CombinedScoreCircuit(treeDepth, cgpaBits) {
    // Public inputs.
    signal input merkleRoot;
    signal input threshold;  // threshold for the combined score.
    // Private inputs.
    signal input studentIndex;
    signal input authPath[treeDepth + 2];
    signal input studentIDHash;
    signal input studentCGPA;      // e.g. scaled by 100
    signal input studentTestScore; // e.g. integer test score

    // Define constant weight.
    var weight = 10;

    // Compute finalScore = studentCGPA + (studentTestScore * weight)
    signal finalScore;
    finalScore <== studentCGPA + (studentTestScore * weight);

    // Recompute the leaf hash using studentIDHash and finalScore.
    component leafHasher = PoseidonHash2();
    leafHasher.in0 <== studentIDHash;
    leafHasher.in1 <== finalScore;
    // The computed leaf must equal the first element of the authentication path.
    leafHasher.out === authPath[0];

    // Verify the Merkle proof.
    component merkleProof = MerkleProof(treeDepth);
    merkleProof.studentIndex <== studentIndex;
    merkleProof.authPath <== authPath;
    authPath[treeDepth + 1] === merkleRoot;

    // Compare finalScore with threshold.
    component cmp = LessThan(cgpaBits);
    cmp.in[0] <== threshold;
    cmp.in[1] <== finalScore;

    // Output: 1 if finalScore > threshold, else 0.
    signal output result;
    result <== cmp.out;
}

component main { public [merkleRoot, threshold] } = CombinedScoreCircuit(10, 16);
