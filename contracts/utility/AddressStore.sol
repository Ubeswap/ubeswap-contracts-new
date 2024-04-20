// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AddressStore {
    address public immutable owner;
    address private value;

    constructor() {
        owner = msg.sender;
    }

    function set(address _value) external {
        require(msg.sender == owner);
        value = _value;
    }

    function get() view external returns(address) {
        return value;
    }
}
