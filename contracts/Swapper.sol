// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Swapper
/// @dev Contract to proxy erc20 token swaps through a specified router
contract Swapper is Ownable {
	using SafeERC20 for IERC20;

	address public router; // aggregation router contract
	bool public restrictCaller = false; // restrict swap to whitelisted callers
	bool public approveMax = true; // default to router max allowance (gas saving)
	bool public autoRevoke = false; // revoke approval after every swap (no need to trust router)
	mapping(address => bool) private whitelist; // whitelisted addresses (for tokens and callers)

	// Events
	event Swapped(
		address indexed user,
		address indexed assetIn,
		address indexed assetOut,
		uint256 amountIn,
		uint256 amountOut
	);
	event Whitelisted(address indexed account);
	event RemovedFromWhitelist(address indexed account);

	/// @param _router Address of the router contract
	constructor(address _router) Ownable(msg.sender) {
		router = _router;
	}

	/// @notice Updates the router address
	/// @param _router New router address
	function setRouter(address _router) external onlyOwner {
		router = _router;
	}

	/// @notice Toggles caller restriction (only whitelisted can swap)
	/// @param _restrictCaller Boolean value to set restrictCaller
	function setCallerRestriction(bool _restrictCaller) external onlyOwner {
		restrictCaller = _restrictCaller;
	}

	/// @notice Toggles default max approval (approve max amount to router on first use)
	/// @param _approveMax Boolean value to set approveMax
	function setApproveMax(bool _approveMax) external onlyOwner {
		approveMax = _approveMax;
	}

	/// @notice Toggles auto revoke approval (revoke router approval after every swap)
	/// @param _autoRevoke Boolean value to set autoRevoke
	function setAutoRevoke(bool _autoRevoke) external onlyOwner {
		autoRevoke = _autoRevoke;
	}

	/// @notice Adds an address (erc20 token or caller) to the whitelist
	/// @param _address Address to be added to the whitelist
	function addToWhitelist(address _address) external onlyOwner {
		whitelist[_address] = true;
		emit Whitelisted(_address);
	}

	/// @notice Removes an address (erc20 token or caller) from the whitelist
	/// @param _address Address to be removed from the whitelist
	function removeFromWhitelist(address _address) external onlyOwner {
		whitelist[_address] = false;
		emit RemovedFromWhitelist(_address);
	}

	/// @notice Checks if an address (erc20 token or caller) is whitelisted
	/// @param _address Address to check
	/// @return Boolean indicating whether the address is whitelisted
	function isWhitelisted(address _address) external view returns (bool) {
		return whitelist[_address];
	}

	/// @notice executes a single swap
	/// @param _input Address of the input token
	/// @param _output Address of the output token
	/// @param _amountIn Amount of input tokens to swap
	/// @param _minAmountOut Minimum amount of output tokens to receive from the swap
	/// @param _routeData Encoded routing data (built off-chain) to be passed to the router
	/// @return received Amount of output tokens received
	function _swap(
		address _input,
		address _output,
		uint256 _amountIn,
		uint256 _minAmountOut,
		bytes memory _routeData
	) internal returns (uint256 received) {
		require(
			whitelist[_input] && whitelist[_output],
			"asset not whitelisted"
		);
		require(
			!restrictCaller || whitelist[msg.sender],
			"caller not whitelisted"
		);

		IERC20 input = IERC20(_input);
		input.safeTransferFrom(msg.sender, address(this), _amountIn);

		if (input.allowance(address(this), router) < _amountIn)
			input.approve(router, approveMax ? type(uint256).max : _amountIn);

		(bool ok, bytes memory receipt) = address(router).call(_routeData);
		require(ok, "router error");

		assembly {
			received := mload(add(receipt, 0x20))
		}

		require(received >= _minAmountOut, "router error or slippage too high");

		IERC20(_output).safeTransfer(msg.sender, received);

		if (autoRevoke) input.approve(router, 0);
		emit Swapped(msg.sender, _input, _output, _amountIn, received);
	}

	/// @notice Executes a swap
	/// @dev Shares the same parameter descriptions as swap
	function swap(
		address _input,
		address _output,
		uint256 _amountIn,
		uint256 _minAmountOut,
		bytes memory _routeData
	) external payable returns (uint256 received) {
		return _swap(_input, _output, _amountIn, _minAmountOut, _routeData);
	}

	/// @notice Helper function to execute multiple swaps
	/// @param _inputs Array of input token addresses
	/// @param _outputs Array of output token addresses
	/// @param _amountsIn Array of input token amounts for each swap
	/// @param _minAmountsOut Array of minimum output token amounts for each swap
	/// @param _routesData Array of encoded routing data (built off-chain) to be passed to the router
	/// @return received Array of output token amounts received for each swap
	function _multiSwap(
		address[] memory _inputs,
		address[] memory _outputs,
		uint256[] memory _amountsIn,
		uint256[] memory _minAmountsOut,
		bytes[] memory _routesData
	) internal returns (uint256[] memory received) {
		require(
			_inputs.length == _outputs.length &&
				_inputs.length == _amountsIn.length &&
				_inputs.length == _minAmountsOut.length &&
				_inputs.length == _routesData.length,
			"invalid input"
		);
		received = new uint256[](_inputs.length);
		for (uint256 i = 0; i < _inputs.length; i++)
			received[i] = _swap(
				_inputs[i],
				_outputs[i],
				_amountsIn[i],
				_minAmountsOut[i],
				_routesData[i]
			);
	}

	/// @notice Executes multiple swaps
	/// @dev Shares the same parameter descriptions as multiSwap
	function multiSwap(
		address[] memory _inputs,
		address[] memory _outputs,
		uint256[] memory _amountsIn,
		uint256[] memory _minAmountsOut,
		bytes[] memory _routesData
	) internal returns (uint256[] memory received) {
		return
			_multiSwap(
				_inputs,
				_outputs,
				_amountsIn,
				_minAmountsOut,
				_routesData
			);
	}
}
