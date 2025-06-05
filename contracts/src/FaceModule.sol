// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./Verifier.sol";

/**
 * @title FaceModule
 * @notice Smart contract for ZK-based face verification using Groth16 proofs
 * @dev This contract integrates with a ZK-SNARK verifier to attest face identities
 */
contract FaceModule {
    // State variable to track used nullifiers to prevent double-spending
    mapping(bytes32 => bool) public registeredNullifiers;
    
    // State variable to track addresses with attested faces
    mapping(address => bool) public attestedFaces;
    
    // Immutable reference to the ZK proof verifier contract
    Groth16Verifier public immutable verifier;
    
    // Expected number of public signals from the ZK circuit
    // NOTE: Updated to match the actual Verifier.sol which expects 4 public signals
    uint256 private constant EXPECTED_PUBLIC_SIGNALS_COUNT = 4;
    
    /**
     * @notice Event emitted when a face is successfully attested
     * @param user The address of the user whose face was attested
     * @param nullifierHash The nullifier hash to prevent reuse
     */
    event FaceAttested(address indexed user, bytes32 indexed nullifierHash);
    
    /**
     * @notice Constructor to initialize the FaceModule with a verifier
     * @param _verifierAddress Address of the deployed Groth16Verifier contract
     */
    constructor(address _verifierAddress) {
        require(_verifierAddress != address(0), "FaceModule: Invalid verifier address");
        verifier = Groth16Verifier(_verifierAddress);
    }
    
    /**
     * @notice Attest a face identity using ZK proof verification
     * @dev CRITICAL: The _publicSignals array structure and content must match exactly 
     *      what P1's circuit and zk-FaceID agent provide. The order and format are crucial.
     *      Expected structure: [signal0, nullifier_hash, signal2, external_nullifier]
     * @param _pA First part of the Groth16 proof (2 elements)
     * @param _pB Second part of the Groth16 proof (2x2 elements)
     * @param _pC Third part of the Groth16 proof (2 elements)
     * @param _publicSignals Array of public inputs from the ZK circuit (4 elements)
     *        - Index 0: First circuit signal
     *        - Index 1: nullifier_hash (must match nullifierHash parameter)
     *        - Index 2: Second circuit signal  
     *        - Index 3: external_nullifier (must match userAddress parameter)
     * @param nullifierHash Unique hash to prevent double attestation (must match _publicSignals[1])
     * @param userAddress Address to associate with the face attestation (must match _publicSignals[3])
     * @return bool True if attestation is successful
     */
    function attestFace(
        uint256[2] memory _pA,
        uint256[2][2] memory _pB,
        uint256[2] memory _pC,
        uint256[4] memory _publicSignals,
        bytes32 nullifierHash,
        address userAddress
    ) public returns (bool) {
        // Prevent nullifier reuse (double-spending protection)
        require(
            !registeredNullifiers[nullifierHash], 
            "FaceModule: Nullifier already registered"
        );
        
        // Ensure nullifierHash parameter matches the nullifier_hash in public signals at index 1
        require(
            bytes32(_publicSignals[1]) == nullifierHash, 
            "FaceModule: Parameter nullifierHash mismatch"
        );
        
        // Ensure userAddress parameter matches the external_nullifier in public signals at index 3
        require(
            uint256(uint160(userAddress)) == _publicSignals[3], 
            "FaceModule: User address mismatch with externalNullifier"
        );
        
        // Verify the ZK proof using the Groth16 verifier
        // This is the core security check - ensures the proof is mathematically valid
        require(
            verifier.verifyProof(_pA, _pB, _pC, _publicSignals), 
            "FaceModule: Invalid ZK proof"
        );
        
        // If all checks pass, register the attestation
        registeredNullifiers[nullifierHash] = true;
        attestedFaces[userAddress] = true;
        
        // Emit event for off-chain tracking
        emit FaceAttested(userAddress, nullifierHash);
        
        return true;
    }
    
    /**
     * @notice Check if an address has a valid face attestation
     * @param userAddress The address to check
     * @return bool True if the address has an attested face
     */
    function isValidFace(address userAddress) public view returns (bool) {
        return attestedFaces[userAddress];
    }
}