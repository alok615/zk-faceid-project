// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/FaceModule.sol";

/**
 * @title FaceModuleTest
 * @notice Basic tests for the FaceModule smart contract
 */
contract FaceModuleTest is Test {
    FaceModule public faceModule;

    /**
     * @notice Set up test environment by deploying FaceModule contract
     */
    function setUp() public {
        faceModule = new FaceModule();
    }

    /**
     * @notice Test that attestFace function exists and returns true
     */
    function testAttestFaceExistsAndReturnsTrue() public view {
        bool result = faceModule.attestFace(new bytes(0), bytes32(uint256(123)), address(this));
        assertTrue(result);
    }

    /**
     * @notice Test that isValidFace function exists and returns false initially
     */
    function testIsValidFaceExistsAndReturnsInitialValue() public view {
        bool result = faceModule.isValidFace(address(this));
        assertFalse(result);
    }
}