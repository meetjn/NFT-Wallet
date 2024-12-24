// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPool} from "@aave/core-v3/contracts/interfaces/IPool.sol";
import {AdvancedSafeWithTokenbound} from "contract/guardian.sol";

/**
 * @title YieldFarming
 * @notice A yield farming contract that integrates with Aave V3 and supports multiple reward tokens
 * @dev Implements staking with Aave integration and custom reward distribution
 */
contract YieldFarming is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    IPool public immutable aavePool;
    mapping(address => uint256) public stakingBalance;
    mapping(address => uint256) public rewardBalance;
    mapping(address => uint256) public lastUpdateTime;
    mapping(address => bool) public supportedTokens;
    
    uint256 public rewardRate;
    uint256 public rewardsDuration;
    uint256 public totalStaked;
    
    IERC20 public stakingToken;
    IERC20 public rewardsToken;
    AdvancedSafeWithTokenbound public tokenboundAccount;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(uint256 reward);
    event TokenSupported(address indexed token, bool status);

    // Errors
    error InvalidAmount();
    error InvalidToken();
    error InvalidDuration();
    error NoRewardsToClaim();
    error StakingPeriodNotEnded();

    constructor(
        address _stakingToken,
        address _rewardsToken,
        address _aavePool,
        address _tokenboundAccount,
        uint256 _rewardRate,
        uint256 _rewardsDuration
    ) Ownable(msg.sender) {
        if (_rewardsDuration == 0) revert InvalidDuration();
        
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        aavePool = IPool(_aavePool);
        tokenboundAccount = AdvancedSafeWithTokenbound(_tokenboundAccount);
        rewardRate = _rewardRate;
        rewardsDuration = _rewardsDuration;
    }

    // Core Functions
    function stake(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        
        updateReward(msg.sender);
        totalStaked += amount;
        stakingBalance[msg.sender] += amount;
        
        // Transfer tokens to contract
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Supply to Aave for additional yield
        stakingToken.approve(address(aavePool), amount);
        aavePool.supply(address(stakingToken), amount, address(this), 0);
        
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (amount > stakingBalance[msg.sender]) revert InvalidAmount();
        
        updateReward(msg.sender);
        totalStaked -= amount;
        stakingBalance[msg.sender] -= amount;
        
        // Withdraw from Aave
        aavePool.withdraw(address(stakingToken), amount, address(this));
        
        // Transfer tokens back to user
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external nonReentrant {
        updateReward(msg.sender);
        uint256 reward = rewardBalance[msg.sender];
        if (reward == 0) revert NoRewardsToClaim();
        
        rewardBalance[msg.sender] = 0;
        rewardsToken.safeTransfer(msg.sender, reward);
        
        emit RewardPaid(msg.sender, reward);
    }

    // Internal Functions
    function updateReward(address account) internal {
        uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
        if (timeElapsed > 0 && stakingBalance[account] > 0) {
            uint256 reward = (stakingBalance[account] * rewardRate * timeElapsed) / 1e18;
            rewardBalance[account] += reward;
            lastUpdateTime[account] = block.timestamp;
        }
    }

    // Admin Functions
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }

    function addRewardTokens(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        rewardsToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardAdded(amount);
    }

    function setSupportedToken(address token, bool status) external onlyOwner {
        supportedTokens[token] = status;
        emit TokenSupported(token, status);
    }

    // View Functions
    function earned(address account) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastUpdateTime[account];
        return rewardBalance[account] + 
               ((stakingBalance[account] * rewardRate * timeElapsed) / 1e18);
    }

    function getStakingBalance(address account) external view returns (uint256) {
        return stakingBalance[account];
    }

    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }
}