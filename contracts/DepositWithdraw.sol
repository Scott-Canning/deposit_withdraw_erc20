//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom( address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract DepositWithdraw {
    address payable owner;

    // user address => user balance
    mapping (address => uint256) public balances;
    mapping (address => Account) public accounts;
    mapping (address => bool) public supportedToken;

    event Deposited(address, uint256);
    event Withdrawn(address, uint256);

    struct Account {
        uint             accountId;
        uint             accountStart;
        address          sourceAsset;
        address          targetAsset;
        uint             sourceBalance;
        uint             targetBalance;
        uint             intervalAmount;
    }

    constructor() {
        owner = payable(msg.sender);
        // load asset addresses into tokenAddress mapping
        supportedToken[address(0xC4375B7De8af5a38a93548eb8453a498222C4fF2)] = true; // DAI
        supportedToken[address(0xd0A1E359811322d97991E03f863a0C30C2cF029C)] = true; // WETH
        supportedToken[address(0xa36085F69e2889c224210F603D836748e7dC0088)] = true; // LINK
    }

    function depositSource(address _token, uint256 _amount) external {
        //require(tokenAddresses[_token] == true, "Unsupported asset type");
        require(_amount > 0, "Insufficient value");
        accounts[msg.sender].sourceBalance += _amount;
        (bool success) = IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        require(success, "Deposit unsuccessful: transferFrom");
        emit Deposited(msg.sender, _amount);
    }

    function withdrawSource(address _token, uint256 _amount) external {
        //require(tokenAddresses[_token] == true, "Unsupported asset type");
        require(accounts[msg.sender].sourceBalance >= _amount);
        accounts[msg.sender].sourceBalance -= _amount;
        (bool success) = IERC20(_token).transfer(msg.sender, _amount);
        require(success, "Withdraw unsuccessful");
        emit Withdrawn(msg.sender, _amount);
    }

    function empty() public {
        require(msg.sender == owner);
        owner.transfer(address(this).balance);
    }

    receive() external payable {}
}
