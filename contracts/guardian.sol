// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITokenboundAccount {
    function execute(address target, uint256 value, bytes calldata data) external returns (bytes memory);
    function transferController(address newController) external;
}

contract AdvancedSafeWithTokenbound {
    // Events
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event TransactionProposed(bytes32 indexed txHash, address indexed proposer, uint256 unlockTime);
    event TransactionApproved(address indexed guardian, bytes32 indexed txHash);
    event TransactionExecuted(bytes32 indexed txHash, address indexed executor);
    event TransactionRevoked(bytes32 indexed txHash, address indexed revoker);
    event OwnerChanged(address indexed oldOwner, address indexed newOwner);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event EmergencyPaused(address indexed initiator);
    event EmergencyUnpaused(address indexed initiator);

    // Errors
    error InvalidAddress(string message);
    error CallerNotOwner();
    error CallerNotGuardian();
    error ContractPaused();
    error GuardianAlreadyExists();
    error GuardianDoesNotExist();
    error TransactionAlreadyProposed();
    error TransactionDoesNotExist();
    error TimelockNotExpired();
    error TransactionAlreadyExecuted();
    error TransactionRevoke();
    error GuardianAlreadyApproved();
    error NotEnoughApprovals(uint256 required, uint256 actual);
    error InvalidThreshold();

    // State variables
    address public owner;
    address public tokenBoundAccount;
    uint256 public guardianApprovalThreshold;
    bool public paused;

    struct Transaction {
        address target;
        uint256 value;
        bytes data;
        uint256 approvals;
        uint256 unlockTime;
        bool executed;
        bool revoked;
    }

    mapping(address => bool) public guardians;
    mapping(bytes32 => Transaction) public transactions;
    mapping(bytes32 => mapping(address => bool)) public transactionApprovals;

    constructor(
        address _owner,
        address _tokenBoundAccount,
        uint256 _guardianApprovalThreshold
    ) {
        if (_owner == address(0) || _tokenBoundAccount == address(0)) {
            revert InvalidAddress("Owner or Tokenbound account address is invalid");
        }
        owner = _owner;
        tokenBoundAccount = _tokenBoundAccount;
        guardianApprovalThreshold = _guardianApprovalThreshold;
    }

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert CallerNotOwner();
        }
        _;
    }

    modifier onlyGuardian() {
        if (!guardians[msg.sender]) {
            revert CallerNotGuardian();
        }
        _;
    }

    modifier notPaused() {
        if (paused) {
            revert ContractPaused();
        }
        _;
    }

    // Guardian Management
    function addGuardian(address guardian) external onlyOwner {
        if (guardians[guardian]) {
            revert GuardianAlreadyExists();
        }
        guardians[guardian] = true;
        emit GuardianAdded(guardian);
    }

    function removeGuardian(address guardian) external onlyOwner {
        if (!guardians[guardian]) {
            revert GuardianDoesNotExist();
        }
        guardians[guardian] = false;
        emit GuardianRemoved(guardian);
    }

    // Transaction Proposal and Management
    function proposeTransaction(
        address target,
        uint256 value,
        bytes calldata data,
        uint256 timelockDuration
    ) external onlyOwner notPaused returns (bytes32) {
        if (target == address(0)) {
            revert InvalidAddress("Target address is invalid");
        }
        bytes32 txHash = keccak256(abi.encode(target, value, data, block.timestamp));
        if (transactions[txHash].unlockTime > 0) {
            revert TransactionAlreadyProposed();
        }

        transactions[txHash] = Transaction({
            target: target,
            value: value,
            data: data,
            approvals: 0,
            unlockTime: block.timestamp + timelockDuration,
            executed: false,
            revoked: false
        });

        emit TransactionProposed(txHash, msg.sender, transactions[txHash].unlockTime);
        return txHash;
    }

    function approveTransaction(bytes32 txHash) external onlyGuardian notPaused {
        Transaction storage transaction = transactions[txHash];
        if (transaction.unlockTime == 0) {
            revert TransactionDoesNotExist();
        }
        if (block.timestamp < transaction.unlockTime) {
            revert TimelockNotExpired();
        }
        if (transaction.executed) {
            revert TransactionAlreadyExecuted();
        }
        if (transaction.revoked) {
            revert TransactionRevoke();
        }
        if (transactionApprovals[txHash][msg.sender]) {
            revert GuardianAlreadyApproved();
        }

        transaction.approvals++;
        transactionApprovals[txHash][msg.sender] = true;

        emit TransactionApproved(msg.sender, txHash);
    }

    function executeTransaction(bytes32 txHash) external onlyOwner notPaused {
        Transaction storage transaction = transactions[txHash];
        if (transaction.approvals < guardianApprovalThreshold) {
            revert NotEnoughApprovals(guardianApprovalThreshold, transaction.approvals);
        }
        if (transaction.executed) {
            revert TransactionAlreadyExecuted();
        }
        if (transaction.revoked) {
            revert TransactionRevoke();
        }

        transaction.executed = true;

        ITokenboundAccount(tokenBoundAccount).execute(
            transaction.target,
            transaction.value,
            transaction.data
        );

        emit TransactionExecuted(txHash, msg.sender);
    }

    function revokeTransaction(bytes32 txHash) external onlyOwner notPaused {
        Transaction storage transaction = transactions[txHash];
        if (transaction.executed) {
            revert TransactionAlreadyExecuted();
        }
        if (transaction.revoked) {
            revert TransactionRevoke();
        }

        transaction.revoked = true;

        emit TransactionRevoked(txHash, msg.sender);
    }

    // Dynamic Threshold Management
    function updateApprovalThreshold(uint256 newThreshold) external onlyOwner {
        if (newThreshold == 0) {
            revert InvalidThreshold();
        }
        uint256 oldThreshold = guardianApprovalThreshold;
        guardianApprovalThreshold = newThreshold;
        emit ThresholdUpdated(oldThreshold, newThreshold);
    }

    // Owner Management
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) {
            revert InvalidAddress("New owner address is invalid");
        }
        emit OwnerChanged(owner, newOwner);
        owner = newOwner;
    }

    function transferTokenboundController(address newController) external onlyOwner {
        if (newController == address(0)) {
            revert InvalidAddress("Controller address is invalid");
        }
        ITokenboundAccount(tokenBoundAccount).transferController(newController);
    }

    // Emergency Management
    function pause() external onlyOwner {
        paused = true;
        emit EmergencyPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit EmergencyUnpaused(msg.sender);
    }

    // Fallback to accept ETH
    receive() external payable {}
}


