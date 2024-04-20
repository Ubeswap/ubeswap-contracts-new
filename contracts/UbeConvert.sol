// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract UbeConvert is ReentrancyGuard, AccessControl, Pausable {
    event TokenReleased(address indexed participant, uint256 amount);

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant WHITELISTER_ROLE = keccak256("WHITELISTER_ROLE");
    bytes32 public immutable SEED = keccak256("UbeSwap");

    address public newUbe;
    address public oldUbe;
    uint256 public startDate;
    uint256 public endDate;
    uint256 public exchangeRate; // for every 100 oldUbe, how many newUbe
    uint256 public totalConvertedOldUbe;
    mapping(address => uint256) public accountToConvertedAmount;

    constructor(
        address _newUbe,
        address _oldUbe,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _exchangeRate
    ) {
        newUbe = _newUbe;
        oldUbe = _oldUbe;
        startDate = _startDate;
        endDate = _endDate;
        exchangeRate = _exchangeRate;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(WHITELISTER_ROLE, msg.sender);
    }

    //////////  SETTERS ///////////
    function setStartDate(uint256 _startDate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        startDate = _startDate;
    }

    function setEndDate(uint256 _endDate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        endDate = _endDate;
    }

    function setExchangeRate(uint256 _exchangeRate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        exchangeRate = _exchangeRate;
    }
    /////////////////////////////////

    /**
     * @param _oldUbeAmount (type uint256) amount of oldUbe tokens to convert
     * @param _maxOldUbeAmount (type uint256) amount of oldUbe tokens the user can convert max
     * @param _signature (type bytes) signature that proves that the caller is whitelisted
     * @dev convert old ube tokens to new
     */
    function convert(uint256 _oldUbeAmount, uint256 _maxOldUbeAmount, bytes memory _signature)
        public
        nonReentrant
        whenNotPaused
        returns (bool sucess)
    {
        bytes32 hash = keccak256(abi.encodePacked(SEED, msg.sender, _maxOldUbeAmount));
        hash = MessageHashUtils.toEthSignedMessageHash(hash);
        (address signer, ECDSA.RecoverError error, ) = ECDSA.tryRecover(hash, _signature);
        require(error == ECDSA.RecoverError.NoError && hasRole(WHITELISTER_ROLE, signer), "You are not whitelisted");

        require(block.timestamp >= startDate && block.timestamp <= endDate, "Conversion is not active");
        uint256 previouslyConverted = accountToConvertedAmount[msg.sender];
        uint256 totalConvertAmount = previouslyConverted + _oldUbeAmount;
        require(totalConvertAmount <= _maxOldUbeAmount, "max limit");
        accountToConvertedAmount[msg.sender] = totalConvertAmount;
        totalConvertedOldUbe += _oldUbeAmount;
        IERC20(oldUbe).transferFrom(msg.sender, address(this), _oldUbeAmount);
        uint256 newAmount = (_oldUbeAmount * exchangeRate) / 100; //10% of the new token
        IERC20(newUbe).transfer(msg.sender, newAmount);
        return true;
    }

    /**
     * @param _token (type address) ERC20 token address (can be buyCurrency)
     * @param _amount (type uint256) amount of buyCurrency
     */
    function withdraw(
        address to,
        address _token,
        uint256 _amount
    ) public onlyRole(DEFAULT_ADMIN_ROLE) returns (bool success) {
        if (_token == address(0)) {
            (bool result, ) = to.call{value: _amount}("");
            return result;
        }
        IERC20(_token).transfer(to, _amount);
        return true;
    }

    /////////
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
