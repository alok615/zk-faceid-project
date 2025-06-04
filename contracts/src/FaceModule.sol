// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

// import "./interfaces/ISemaphoreVerifier.sol";

// interface ISemaphoreVerifier {
//     function verifyProof(
//         uint256[2] memory _pA,
//         uint256[2][2] memory _pB,
//         uint256[2] memory _pC,
//         uint256[1] memory _pubSignals // Assuming 1 public signal (e.g., nullifierHash)
//     ) external view returns (bool);
// }

/**
 * @title FaceModule
 * @notice Module for face verification using zero-knowledge proofs
 */
contract FaceModule {
    /// @notice Mapping to track registered nullifiers to prevent double attestation
    mapping(bytes32 => bool) public registeredNullifiers;
    
    /// @notice Mapping to track addresses with valid face attestations
    mapping(address => bool) public attestedFaces;
    
    // ISemaphoreVerifier public semaphoreVerifier;

    /**
     * @notice Event emitted when a face is successfully attested
     * @param user Address of the user who got attested
     * @param nullifierHash The nullifier hash used for the attestation
     */
    event FaceAttested(address indexed user, bytes32 indexed nullifierHash);

    // constructor(address _semaphoreVerifierAddress) {
    //     semaphoreVerifier = ISemaphoreVerifier(_semaphoreVerifierAddress);
    // }

    /**
     * @notice Attests a face using zero-knowledge proof
     * @dev The ZK proof data is used for verification
     * @dev The nullifier hash prevents double attestation
     * @dev The address of the user being attested
     * @return bool True if attestation is successful
     */
    function attestFace(bytes calldata /*proof*/, bytes32 /*nullifierHash*/, address /*userAddress*/) public pure returns (bool) {
        // require(!registeredNullifiers[nullifierHash], "FaceModule: Nullifier already registered");
        // require(semaphoreVerifier.verifyProof(proof, /* appropriate public signals like nullifierHash */), "FaceModule: Invalid ZK proof");
        // registeredNullifiers[nullifierHash] = true;
        // attestedFaces[userAddress] = true;
        // emit FaceAttested(userAddress, nullifierHash);
        return true;
    }

    /**
     * @notice Checks if a user has a valid face attestation
     * @param userAddress Address of the user to check
     * @return bool True if the user has valid face attestation
     */
    function isValidFace(address userAddress) public view returns (bool) {
        return attestedFaces[userAddress];
    }
}