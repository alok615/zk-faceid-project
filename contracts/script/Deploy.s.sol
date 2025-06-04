// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/Vault.sol";
import "../src/FaceModule.sol";

/**
 * @title Deploy
 * @notice Foundry script to deploy FaceModule and Vault contracts
 */
contract Deploy is Script {
    /**
     * @notice Deploys FaceModule and Vault contracts
     * @return faceModuleAddr The deployed FaceModule contract address
     * @return vaultAddr The deployed Vault contract address
     */
    function run() public returns (address faceModuleAddr, address vaultAddr) {
        // Load the deployer's private key from the environment variable
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Start broadcasting transactions with the deployer's key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy FaceModule contract
        FaceModule faceModule = new FaceModule();
        faceModuleAddr = address(faceModule);

        // Deploy Vault contract, passing the FaceModule address to the constructor
        Vault vault = new Vault(faceModuleAddr);
        vaultAddr = address(vault);

        // Stop broadcasting transactions
        vm.stopBroadcast();

        // Return the deployed contract addresses
        return (faceModuleAddr, vaultAddr);
    }
}