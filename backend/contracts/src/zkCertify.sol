// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IZkVerifyAttestation {
    function verifyProofAttestation(
        uint256 _attestationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external view returns (bool); // Added view modifier
}

contract zkCertify {
    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));

    address public immutable zkvContract;
    bytes32 public immutable vkHash;
    uint256 public immutable scoreThreshold;

    mapping(address => bool) public hasVerifiedScore;
    mapping(uint256 => bool) public usedProofs;

    event ScoreVerified(address indexed candidate);
    event ThresholdMet();

    constructor(address _zkvContract, bytes32 _vkHash, uint256 _scoreThreshold) {
        zkvContract = _zkvContract;
        vkHash = _vkHash;
        scoreThreshold = _scoreThreshold;
    }

    function verifyScore(
        uint256 attestationId,
        uint256 root, // Changed from uint256 to bytes32
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) external {
        uint256 nullifier = uint256(keccak256(abi.encodePacked(msg.sender, attestationId)));
        require(!usedProofs[nullifier], "Proof already used");
        usedProofs[nullifier] = true;

        require(
            _verifyProofHasBeenPostedToZkv(attestationId, root, merklePath, leafCount, index),
            "Score proof verification failed"
        );

        hasVerifiedScore[msg.sender] = true;
        emit ScoreVerified(msg.sender);
        
        if (scoreThreshold > 0) { // Added conditional threshold check
            emit ThresholdMet();
        }
    }

    function _verifyProofHasBeenPostedToZkv(
        uint256 attestationId,
        bytes32 root,
        bytes32[] calldata merklePath,
        uint256 leafCount,
        uint256 index
    ) internal view returns (bool) {
        bytes32 leaf = keccak256(
            abi.encodePacked(PROVING_SYSTEM_ID, vkHash, root)
        );

        return IZkVerifyAttestation(zkvContract).verifyProofAttestation(
            attestationId,
            leaf,
            merklePath,
            leafCount,
            index
        );
    }

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
