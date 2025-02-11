// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract zkCGPA {
    // Declare the proving system ID constant.
    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));

    // Immutable variables set on deployment.
    address public immutable zkvContract;
    bytes32 public immutable vkHash;
    uint256 public immutable cgpaThreshold;

    // Track verified students.
    mapping(address => bool) public hasVerifiedCGPA;
    // Prevent replay attacks (using a computed nullifier).
    mapping(uint256 => bool) public usedProofs;

    // Events for logging verification.
    event CGPAVerified(address indexed student);
    event ThresholdMet();

    constructor(
        address _zkvContract, 
        bytes32 _vkHash,
        uint256 _cgpaThreshold
    ) {
        zkvContract = _zkvContract;
        vkHash = _vkHash;
        cgpaThreshold = _cgpaThreshold;
    }

    /**
     * @notice Verifies that the student's CGPA (as proven off-chain) meets the threshold.
     * @param attestationId The attestation ID from zkVerify.
     * @param root The Merkle tree root.
     * @param cgpa The student's CGPA (scaled as in the off-chain computation).
     * @param merklePath The Merkle proof path.
     * @param leafCount The total number of leaves in the Merkle tree.
     * @param index The index of the student leaf in the tree.
     */
    function verifyCGPA(
        uint256 attestationId,
        uint256 root, 
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) external {
        // Check that the provided CGPA meets the threshold requirement.

        // Generate a nullifier from msg.sender and attestationId to prevent replays.
        uint256 nullifier = uint256(keccak256(abi.encodePacked(
            msg.sender,
            attestationId
        )));
        require(!usedProofs[nullifier], "Proof already used");
        usedProofs[nullifier] = true;

        // Verify the zkSNARK proof by calling the external verifier contract.
        require(
            _verifyProofHasBeenPostedToZkv(
                attestationId,
                root,
                merklePath,
                leafCount,
                index
            ),
            "CGPA proof verification failed"
        );

        // Mark the sender as having verified their CGPA.
        hasVerifiedCGPA[msg.sender] = true;

        emit CGPAVerified(msg.sender);
        emit ThresholdMet();
    }

    /**
     * @notice Internal function to verify the proof by interacting with the external verifier contract.
     * @param attestationId The attestation ID.
     * @param root The Merkle tree root.
     * @param merklePath The Merkle proof path.
     * @param leafCount Total number of leaves.
     * @param index The index of the verified leaf.
     * @return True if the external verification call returns true.
     */
    function _verifyProofHasBeenPostedToZkv(
        uint256 attestationId,
        uint256 root,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) internal view returns (bool) {
        // Pack the converted root.
        bytes memory encodedInput = abi.encodePacked(
            _changeEndianess(root)
        );
        
        // Compute a leaf value based on the proving system ID, verification key hash, 
        // and the hash of the encoded input.
        bytes32 leaf = keccak256(
            abi.encodePacked(PROVING_SYSTEM_ID, vkHash, keccak256(encodedInput))
        );

        // Perform a static call to the external verifier contract.
        (bool callSuccessful, bytes memory validProof) = zkvContract.staticcall(
            abi.encodeWithSignature(
                "verifyProofAttestation(uint256,bytes32,bytes32[],uint256,uint256)",
                attestationId,
                leaf,
                merklePath,
                leafCount,
                index
            )
        );
        require(callSuccessful, "Failed to call zkvContract");
        return abi.decode(validProof, (bool));
    }

    /**
     * @notice Internal function to change the endianness of an input.
     * @param input The input number.
     * @return v The number with changed endianness.
     */
    function _changeEndianess(uint256 input) internal pure returns (uint256 v) {
        v = input;
        v = ((v & 0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00) >> 8) |
            ((v & 0x00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF) << 8);
        v = ((v & 0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000) >> 16) |
            ((v & 0x0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF) << 16);
        v = ((v & 0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000) >> 32) |
            ((v & 0x00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF) << 32);
        v = ((v & 0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000) >> 64) |
            ((v & 0x0000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF) << 64);
        v = (v >> 128) | (v << 128);
    }
}
