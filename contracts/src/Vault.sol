// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

/**
 * @title IFaceModule
 * @notice Interface for face verification module
 */
interface IFaceModule {
    /**
     * @notice Attests a face using zero-knowledge proof
     * @param _pA First part of the Groth16 proof (2 elements)
     * @param _pB Second part of the Groth16 proof (2x2 elements)
     * @param _pC Third part of the Groth16 proof (2 elements)
     * @param _publicSignals Array of public inputs from the ZK circuit (4 elements)
     * @param nullifierHash Unique hash to prevent double attestation
     * @param userAddress Address to associate with the face attestation
     * @return bool True if attestation is successful
     */
    function attestFace(
        uint256[2] memory _pA,
        uint256[2][2] memory _pB,
        uint256[2] memory _pC,
        uint256[4] memory _publicSignals,
        bytes32 nullifierHash,
        address userAddress
    ) external returns (bool);
    
    /**
     * @notice Checks if a user has a valid face attestation
     * @param userAddress Address of the user to check
     * @return bool True if the user has valid face attestation
     */
    function isValidFace(address userAddress) external view returns (bool);
}

/**
 * @title Vault
 * @notice Main vault contract for managing credit lines and loans with face verification
 */
contract Vault {
    /// @notice The face module instance for verification
    IFaceModule public faceModule;

    /**
     * @notice Constructor to initialize the vault with a face module
     * @param _faceModuleAddress Address of the deployed face module contract
     */
    constructor(address _faceModuleAddress) {
        faceModule = IFaceModule(_faceModuleAddress);
    }

    /**
     * @notice Opens a credit line for a user based on their score
     * @param userAddress Address of the user requesting credit
     * @param score Credit score or risk assessment value
     */
    function openCreditLine(address userAddress, uint256 score) public {
        // TODO: Implement logic based on score and FaceModule validation
        // Should verify user's face attestation before opening credit line
        // Should store credit line details and limits based on score
    }

    /**
     * @notice Disburses a loan to the caller
     */
    function disburseLoan() public {
        // TODO: Implement loan disbursement logic
        // Should check if caller has valid credit line
        // Should verify face attestation before disbursing
        // Should update loan balances and terms
    }

    /**
     * @notice Settles loan repayment
     * @param repaymentData Encoded repayment information
     */
    function settle(bytes calldata repaymentData) public {
        // TODO: Implement repayment settlement logic, likely callable by an authorized address
        // Should process repayment data and update loan status
        // Should handle partial/full repayments
        // May require authorization checks for who can call this function
    }
}