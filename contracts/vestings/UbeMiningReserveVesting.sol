// SPDX-License-Identifier: MIT
// Ubeswap Mining Reserve Vesting
pragma solidity ^0.8.9;

import "../openzeppelin-solidity/contracts/SafeERC20.sol";
import "../openzeppelin-solidity/contracts/Address.sol";
import "../openzeppelin-solidity/contracts/Context.sol";
import "../openzeppelin-solidity/contracts/Math.sol";

contract UbeMiningReserveVesting is Context {
    event Released(uint256 amount);

    uint256 private _released;
    address private immutable _token;
    address private immutable _beneficiary;
    uint64 private immutable _start;
    uint64 private immutable _duration;
    uint64 private immutable _interval;

    /**
     * @dev Set the token, beneficiary, start timestamp, vesting duration and release interval of the vesting wallet.
     */
    constructor(
        address token,
        address beneficiaryAddress,
        uint64 startTimestamp,
        uint64 durationSeconds,
        uint64 intervalSeconds
    ) {
        require(token != address(0), "invalid token");
        require(beneficiaryAddress != address(0), "invalid beneficiary");
        _token = token;
        _beneficiary = beneficiaryAddress;
        _start = startTimestamp;
        _duration = durationSeconds;
        _interval = intervalSeconds;
    }

    /**
     * @dev Getter for the beneficiary address.
     */
    function beneficiary() public view virtual returns (address) {
        return _beneficiary;
    }

    /**
     * @dev Getter for the start timestamp.
     */
    function start() public view virtual returns (uint256) {
        return _start;
    }

    /**
     * @dev Getter for the vesting duration.
     */
    function duration() public view virtual returns (uint256) {
        return _duration;
    }

    /**
     * @dev Getter for the vesting interval.
     */
    function interval() public view virtual returns (uint256) {
        return _interval;
    }

    /**
     * @dev Amount of eth already released
     */
    function released() public view virtual returns (uint256) {
        return _released;
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {Released} event.
     */
    function release() public virtual {
        uint256 releasable = vestedAmount(uint64(block.timestamp)) - released();
        require(releasable > 0, "Release: No vestable amount");
        _released += releasable;
        emit Released(releasable);
        SafeERC20.safeTransfer(IERC20(_token), beneficiary(), releasable);
    }

    /**
     * @dev Release the tokens that have already vested.
     *
     * Emits a {Release} event.
     */
    function releaseAmount(uint256 amount) public virtual {
        uint256 releasable = vestedAmount(uint64(block.timestamp)) - released();
        require(releasable > 0, "Release: No vestable amount");
        require(amount > 0, "Release: amount > 0");
        require(amount <= releasable, "Release: amount <= releasable");

        _released += amount;
        emit Released(amount);
        SafeERC20.safeTransfer(IERC20(_token), beneficiary(), amount);
    }

    /**
     * @dev Calculates the amount of tokens that has already vested. Default implementation is a linear vesting curve.
     */
    function vestedAmount(uint64 timestamp) public view virtual returns (uint256) {
        return _vestingSchedule(IERC20(_token).balanceOf(address(this)) + released(), timestamp);
    }

    /**
     * Recovery function
     */
    function withdraw(
        address to,
        address token,
        uint256 amount
    ) public returns (bool success) {
        require(_beneficiary == msg.sender, "only beneficiary");
        require(_token != token, "invalid token");
        if (token == address(0)) {
            (bool result, ) = to.call{value: amount}("");
            return result;
        }
        IERC20(token).transfer(to, amount);
        return true;
    }


    /**
     * @dev Virtual implementation of the vesting formula. This returns the amout vested, as a function of time, for
     * an asset given its total historical allocation.
     */
    function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256) {
        if (timestamp < start()) {
            return 0;
        } else if (timestamp > start() + duration()) {
            return totalAllocation;
        } else {
            // totalAllocation = balance + released
            uint256 elapsedFromStart = timestamp - start();
            uint256 vestingCount = duration() / interval();
            uint256 vestingAmount = totalAllocation / vestingCount;
            uint256 passedIntervalCount = elapsedFromStart / interval();
            return passedIntervalCount * vestingAmount;
        }
    }
}
