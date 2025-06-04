// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/Vault.sol";
import "../src/FaceModule.sol";

/**
 * @title VaultTest
 * @notice Basic tests for the Vault smart contract
 */
contract VaultTest is Test {
    Vault public vault;
    FaceModule public faceModule;

    /**
     * @notice Set up test environment by deploying contracts
     */
    function setUp() public {
        faceModule = new FaceModule();
        vault = new Vault(address(faceModule));
    }

    /**
     * @notice Test that openCreditLine function exists and is callable
     */
    function testOpenCreditLineExists() public {
        vault.openCreditLine(address(this), 75);
    }

    /**
     * @notice Test that disburseLoan function exists and is callable
     */
    function testDisburseLoanExists() public {
        vault.disburseLoan();
    }

    /**
     * @notice Test that settle function exists and is callable
     */
    function testSettleExists() public {
        bytes memory dummyData = "";
        vault.settle(dummyData);
    }
}