// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FaceModule.sol";
import "../src/Verifier.sol";

/**
 * @title FaceModuleTest
 * @notice Comprehensive tests for the FaceModule smart contract
 */
contract FaceModuleTest is Test {
    FaceModule public faceModule;
    Groth16Verifier public verifier;
    
    // Test constants
    address constant USER_ADDRESS = address(0x123);
    bytes32 constant NULLIFIER_HASH = bytes32(uint256(0xabc));
    
    // Event declaration for testing
    event FaceAttested(address indexed user, bytes32 indexed nullifierHash);

    /**
     * @notice Set up test environment by deploying contracts
     */
    function setUp() public {
        // Deploy the verifier first
        verifier = new Groth16Verifier();
        
        // Deploy FaceModule with verifier address
        faceModule = new FaceModule(address(verifier));
    }

    /**
     * @notice Helper function to create dummy proof components
     */
    function _createDummyProof() internal pure returns (
        uint256[2] memory pA,
        uint256[2][2] memory pB,
        uint256[2] memory pC
    ) {
        pA = [uint256(1), 2];
        pB = [[uint256(1), 2], [uint256(3), 4]];
        pC = [uint256(1), 2];
    }

    /**
     * @notice Helper function to create default public signals
     */
    function _createDefaultPublicSignals() internal pure returns (uint256[4] memory publicSignals) {
        publicSignals[0] = uint256(0x01); // Mock Merkle Root
        publicSignals[1] = uint256(NULLIFIER_HASH); // Nullifier Hash
        publicSignals[2] = uint256(0x02); // Mock Signal Hash
        publicSignals[3] = uint256(uint160(USER_ADDRESS)); // External Nullifier matching USER_ADDRESS
    }

    /**
     * @notice Test successful face attestation
     */
    function test_attestFace_success() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        uint256[4] memory publicSignals = _createDefaultPublicSignals();
        
        // Mock the verifier.verifyProof call to return true
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pA, pB, pC, publicSignals),
            abi.encode(true)
        );
        
        // Assert initial state - user should not be valid initially
        assertFalse(faceModule.isValidFace(USER_ADDRESS));
        
        // Expect the FaceAttested event to be emitted
        vm.expectEmit(true, true, true, true, address(faceModule));
        emit FaceAttested(USER_ADDRESS, NULLIFIER_HASH);
        
        // Call attestFace
        bool result = faceModule.attestFace(pA, pB, pC, publicSignals, NULLIFIER_HASH, USER_ADDRESS);
        
        // Assert successful result
        assertTrue(result);
        
        // Assert that nullifier is now registered
        assertTrue(faceModule.registeredNullifiers(NULLIFIER_HASH));
        
        // Assert that user face is now attested
        assertTrue(faceModule.attestedFaces(USER_ADDRESS));
        
        // Assert that isValidFace returns true
        assertTrue(faceModule.isValidFace(USER_ADDRESS));
    }

    /**
     * @notice Test that attestation fails when nullifier is already registered
     */
    function test_attestFace_fail_nullifierAlreadyRegistered() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        uint256[4] memory publicSignals = _createDefaultPublicSignals();
        
        // First, successfully attest the face
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pA, pB, pC, publicSignals),
            abi.encode(true)
        );
        
        // First attestation should succeed
        faceModule.attestFace(pA, pB, pC, publicSignals, NULLIFIER_HASH, USER_ADDRESS);
        
        // Second attestation with same nullifier should fail
        vm.expectRevert("FaceModule: Nullifier already registered");
        faceModule.attestFace(pA, pB, pC, publicSignals, NULLIFIER_HASH, USER_ADDRESS);
    }

    /**
     * @notice Test that attestation fails when nullifierHash parameter doesn't match public signals
     */
    function test_attestFace_fail_nullifierHashMismatch() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        uint256[4] memory publicSignals = _createDefaultPublicSignals();
        
        // Create a different nullifier hash that doesn't match publicSignals[1]
        bytes32 differentNullifierHash = bytes32(uint256(0xdef));
        
        // Expect revert due to nullifier hash mismatch
        vm.expectRevert("FaceModule: Parameter nullifierHash mismatch");
        faceModule.attestFace(pA, pB, pC, publicSignals, differentNullifierHash, USER_ADDRESS);
    }

    /**
     * @notice Test that attestation fails when user address doesn't match external nullifier
     */
    function test_attestFace_fail_userAddressMismatch() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        
        // Create public signals with different external nullifier (different address)
        uint256[4] memory publicSignalsInvalidUser;
        publicSignalsInvalidUser[0] = uint256(0x01); // Mock Merkle Root
        publicSignalsInvalidUser[1] = uint256(NULLIFIER_HASH); // Nullifier Hash
        publicSignalsInvalidUser[2] = uint256(0x02); // Mock Signal Hash
        publicSignalsInvalidUser[3] = uint256(uint160(address(0x456))); // Different address
        
        // Expect revert due to user address mismatch
        vm.expectRevert("FaceModule: User address mismatch with externalNullifier");
        faceModule.attestFace(pA, pB, pC, publicSignalsInvalidUser, NULLIFIER_HASH, USER_ADDRESS);
    }

    /**
     * @notice Test that attestation fails when ZK proof is invalid
     */
    function test_attestFace_fail_invalidProof() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        uint256[4] memory publicSignals = _createDefaultPublicSignals();
        
        // Mock the verifier.verifyProof call to return false
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pA, pB, pC, publicSignals),
            abi.encode(false)
        );
        
        // Expect revert due to invalid proof
        vm.expectRevert("FaceModule: Invalid ZK proof");
        faceModule.attestFace(pA, pB, pC, publicSignals, NULLIFIER_HASH, USER_ADDRESS);
    }

    /**
     * @notice Test that constructor fails with zero verifier address
     */
    function test_constructor_fail_zeroVerifierAddress() public {
        // Expect revert when deploying with zero address
        vm.expectRevert("FaceModule: Invalid verifier address");
        new FaceModule(address(0));
    }

    /**
     * @notice Test that isValidFace returns false for non-attested addresses
     */
    function test_isValidFace_returnsInitialValue() public view {
        // Should return false for any address that hasn't been attested
        assertFalse(faceModule.isValidFace(USER_ADDRESS));
        assertFalse(faceModule.isValidFace(address(0x456)));
        assertFalse(faceModule.isValidFace(address(this)));
    }

    /**
     * @notice Test multiple users can attest with different nullifiers
     */
    function test_attestFace_multipleUsers() public {
        (uint256[2] memory pA, uint256[2][2] memory pB, uint256[2] memory pC) = _createDummyProof();
        
        address user2 = address(0x789);
        bytes32 nullifier2 = bytes32(uint256(0xdef));
        
        // Prepare public signals for first user
        uint256[4] memory publicSignals1;
        publicSignals1[0] = uint256(0x01);
        publicSignals1[1] = uint256(NULLIFIER_HASH);
        publicSignals1[2] = uint256(0x02);
        publicSignals1[3] = uint256(uint160(USER_ADDRESS));
        
        // Prepare public signals for second user
        uint256[4] memory publicSignals2;
        publicSignals2[0] = uint256(0x01);
        publicSignals2[1] = uint256(nullifier2);
        publicSignals2[2] = uint256(0x02);
        publicSignals2[3] = uint256(uint160(user2));
        
        // Mock verifier calls for both users
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pA, pB, pC, publicSignals1),
            abi.encode(true)
        );
        vm.mockCall(
            address(verifier),
            abi.encodeWithSelector(Groth16Verifier.verifyProof.selector, pA, pB, pC, publicSignals2),
            abi.encode(true)
        );
        
        // Attest both users
        faceModule.attestFace(pA, pB, pC, publicSignals1, NULLIFIER_HASH, USER_ADDRESS);
        faceModule.attestFace(pA, pB, pC, publicSignals2, nullifier2, user2);
        
        // Both users should be valid
        assertTrue(faceModule.isValidFace(USER_ADDRESS));
        assertTrue(faceModule.isValidFace(user2));
        
        // Both nullifiers should be registered
        assertTrue(faceModule.registeredNullifiers(NULLIFIER_HASH));
        assertTrue(faceModule.registeredNullifiers(nullifier2));
    }
}