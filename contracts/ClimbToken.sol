//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IClimb.sol";
import "./interfaces/IUniswapV2Router02.sol";

/**
 * Contract: Climb Token (xUSD fork)
 * By: SA69
 *
 * Token with a built-in Automated Market Maker
 * Send BNB to contract and it will mint CLIMB Tokens
 * Stake BUSD into contract and it will mint CLIMB Tokens
 * Sell this token to redeem underlying BUSD Tokens
 * Price is calculated as a ratio between Total Supply and underlying asset quantity in Contract
 */
// TODO implement a swap between STABLE TOKENS
// TODO token receives both USDT and BUSD

contract ClimbToken is IERC20, ReentrancyGuard {
    using Address for address;

    struct Stable {
        uint balance;
        bool accepted;
    }

    // token data
    string public constant name = "ClimbV2";
    string public constant symbol = "CLIMBv2";
    uint8 public constant decimals = 18;
    // Math constants
    uint256 constant precision = 1 ether;

    // lock to Matrix contract
    mapping(address => bool) public isMatrix;

    // 1 CLIMB Starting Supply
    uint256 public totalSupply = 1 ether;

    // balances
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    mapping(address => Stable) public stables;

    // Fees
    uint256 public mintFee = 950; // 5.0% buy fee
    uint256 public sellFee = 950; // 5.0% sell fee
    uint256 public transferFee = 950; // 5.0% transfer fee
    uint256 public constant feeDenominator = 1000;

    uint256 public devShare = 100; // 1%
    uint256 public liquidityShare = 400; // 4%

    address public dev = 0xB66D12b3b51010ac743df691Fe781f6a5E303261;

    // Underlying Asset
    address public constant _underlying =
        0x55d398326f99059fF775485246999027B3197955; // USDT

    // fee exemption for utility
    mapping(address => bool) public isFeeExempt;

    // volume for each recipient
    mapping(address => uint256) _volumeFor;

    // PCS Router
    IUniswapV2Router02 _router;

    // BNB -> Token
    address[] path;

    // token purchase slippage maximum
    uint256 public _tokenSlippage = 995;

    // owner
    address _owner;

    // Activates Token Trading
    bool Token_Activated;

    modifier onlyOwner() {
        require(msg.sender == _owner, "Only Owner Function");
        _;
    }

    // initialize some stuff
    constructor() {
        // router
        _router = IUniswapV2Router02(
            0x10ED43C718714eb63d5aA57B78B54704E256024E // PCS V2
        );
        path = new address[](2);
        path[0] = _router.WETH();
        path[1] = _underlying;

        // fee exempt this + owner + router for LP injection
        isFeeExempt[address(this)] = true;
        isFeeExempt[msg.sender] = true;
        isFeeExempt[address(_router)] = true;

        // allocate one token to dead wallet to ensure total supply never reaches 0
        address dead = 0x000000000000000000000000000000000000dEaD;
        _balances[address(this)] = (totalSupply - 1);
        _balances[dead] = 1;

        // ownership
        _owner = msg.sender;

        // emit allocations
        emit Transfer(address(0), address(this), (totalSupply - 1));
        emit Transfer(address(0), dead, 1);
    }

    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    function allowance(
        address holder,
        address spender
    ) external view override returns (uint256) {
        return _allowances[holder][spender];
    }

    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /** Transfer Function */
    function transfer(
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        return _transferFrom(msg.sender, recipient, amount);
    }

    /** Transfer Function */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external override returns (bool) {
        uint currentAllowance = _allowances[sender][msg.sender];
        require(
            currentAllowance >= amount,
            "Transfer amount exceeds allowance"
        );
        _allowances[sender][msg.sender] = currentAllowance - amount;

        return _transferFrom(sender, recipient, amount);
    }

    /** Internal Transfer */
    function _transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) internal returns (bool) {
        // make standard checks
        require(
            recipient != address(0) && sender != address(0),
            "Transfer To Zero Address"
        );
        require(amount > 0, "Transfer amount must be greater than zero");
        // track price change
        uint256 oldPrice = _calculatePrice();

        // fee exempt
        bool takeFee = !(isFeeExempt[sender] || isFeeExempt[recipient]);

        // amount to give recipient
        uint256 tAmount = takeFee
            ? (amount * transferFee) / feeDenominator
            : amount;

        // tax taken from transfer
        uint256 tax = amount - tAmount;
        require(_balances[sender] >= amount, "Insufficient Balance");
        // subtract from sender
        _balances[sender] -= amount;

        if (takeFee) {
            // allocate dev share
            uint256 allocation = (tax * devShare) / (devShare + liquidityShare);
            // mint to dev
            _mint(dev, allocation);
        }

        // give reduced amount to receiver
        _balances[recipient] += tAmount;

        // burn the tax
        if (tax > 0) {
            totalSupply -= tax;
            emit Transfer(sender, address(0), tax);
        }

        // volume for
        _volumeFor[sender] += amount;
        _volumeFor[recipient] += tAmount;

        // Price difference
        uint256 currentPrice = _calculatePrice();
        // Require Current Price >= Last Price
        require(
            currentPrice >= oldPrice,
            "Price Must Rise For Transaction To Conclude"
        );
        // Transfer Event
        emit Transfer(sender, recipient, tAmount);
        // Emit The Price Change
        emit PriceChange(oldPrice, currentPrice, totalSupply);
        return true;
    }

    /** Receives Underlying Tokens and Deposits CLIMB in Sender's Address, Must Have Prior Approval */
    function buy(uint256 numTokens) external nonReentrant returns (bool) {
        return _stakeUnderlyingAsset(numTokens, msg.sender);
    }

    /** Receives Underlying Tokens and Deposits CLIMB in Recipient's Address, Must Have Prior Approval */
    function buy(
        address recipient,
        uint256 numTokens
    ) external nonReentrant returns (bool) {
        return _stakeUnderlyingAsset(numTokens, recipient);
    }

    /** Sells CLIMB Tokens And Deposits Underlying Asset Tokens into Seller's Address */
    function sell(uint256 tokenAmount) external nonReentrant {
        _sell(tokenAmount, msg.sender);
    }

    /** Sells CLIMB Tokens And Deposits Underlying Asset Tokens into Recipients's Address */
    function sell(
        address recipient,
        uint256 tokenAmount
    ) external nonReentrant {
        _sell(tokenAmount, recipient);
    }

    /** Sells All CLIMB Tokens And Deposits Underlying Asset Tokens into Seller's Address */
    function sellAll() external nonReentrant {
        _sell(_balances[msg.sender], msg.sender);
    }

    /** Sells Without Including Decimals */
    function sellInWholeTokenAmounts(uint256 amount) external nonReentrant {
        _sell(amount * 10 ** decimals, msg.sender);
    }

    /** Deletes CLIMB Tokens Sent To Contract */
    function takeOutGarbage() external nonReentrant {
        _checkGarbageCollector();
    }

    /** Allows A User To Erase Their Holdings From Supply */
    function eraseHoldings(uint256 nHoldings) external {
        // get balance of caller
        uint256 bal = _balances[msg.sender];
        require(bal >= nHoldings && bal > 0, "Zero Holdings");
        // if zero erase full balance
        uint256 burnAmount = nHoldings == 0 ? bal : nHoldings;
        // Track Change In Price
        uint256 oldPrice = _calculatePrice();
        // burn tokens from sender + supply
        _burn(msg.sender, burnAmount);
        // Emit Price Difference
        emit PriceChange(oldPrice, _calculatePrice(), totalSupply);
        // Emit Call
        emit ErasedHoldings(msg.sender, burnAmount);
    }

    ///////////////////////////////////
    //////  EXTERNAL FUNCTIONS  ///////
    ///////////////////////////////////

    /** Burns CLIMB Token with BNB */
    function burn() external payable {
        uint256 prevAmount = _balances[address(this)];
        _purchase(address(this));
        uint256 amount = _balances[address(this)] - prevAmount;
        _burn(address(this), amount);
    }

    /** Burns CLIMB Token from msg.sender */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /** Burns CLIMB Token with Underlying, Must Have Prior Approval */
    function burnWithUnderlying(uint256 underlyingAmount) external {
        IERC20(_underlying).transferFrom(
            msg.sender,
            address(this),
            underlyingAmount
        );
        uint256 prevAmount = _balances[address(this)];
        _stakeUnderlyingAsset(underlyingAmount, address(this));
        uint256 amount = _balances[address(this)] - prevAmount;
        _burn(address(this), amount);
    }

    ///////////////////////////////////
    //////  INTERNAL FUNCTIONS  ///////
    ///////////////////////////////////

    /** Requires Price of CLIMB Token to Rise for The Transaction to Conclude */
    function _requirePriceRises(uint256 oldPrice) internal {
        // price after transaction
        uint256 newPrice = _calculatePrice();
        // require price to rise
        require(
            newPrice >= oldPrice,
            "Price Must Rise For Transaction To Conclude"
        );
        emit PriceChange(oldPrice, newPrice, totalSupply);
    }

    /** Purchases CLIMB Token and Deposits Them in Recipient's Address */
    function _purchase(address recipient) private nonReentrant returns (bool) {
        // make sure it's not locked
        require(
            Token_Activated || msg.sender == _owner || isMatrix[msg.sender],
            "CLIMB is Currently Locked Inside the Matrix"
        );
        // calculate price change
        uint256 oldPrice = _calculatePrice();
        // previous amount of underlying asset before we received any
        uint256 prevTokenAmount = IERC20(_underlying).balanceOf(address(this));
        // minimum output amount
        uint256 minOut = (_router.getAmountsOut(msg.value, path)[1] *
            _tokenSlippage) / 1000;
        // buy Token with the BNB received
        _router.swapExactETHForTokens{value: msg.value}(
            minOut,
            path,
            address(this),
            block.timestamp + 30
        );
        // balance of underlying asset after swap
        uint256 currentTokenAmount = IERC20(_underlying).balanceOf(
            address(this)
        );
        // number of Tokens we have purchased
        uint256 difference = currentTokenAmount - prevTokenAmount;
        // if this is the first purchase, use new amount
        prevTokenAmount = prevTokenAmount == 0
            ? currentTokenAmount
            : prevTokenAmount;
        // differentiate purchase
        emit TokenPurchased(difference, recipient);
        // mint to recipient
        return _handleMinting(recipient, difference, prevTokenAmount, oldPrice);
    }

    // @audit - instead of returning BOOL which is useless, return the amount of tokens that were minted
    /** Stake Underlying Tokens and Deposits CLIMB in Sender's Address, Must Have Prior Approval */
    function _stakeUnderlyingAsset(
        uint256 numTokens,
        address recipient
    ) internal returns (bool) {
        // make sure it's not locked
        require(
            Token_Activated || msg.sender == _owner || isMatrix[msg.sender],
            "CLIMB is Currently Locked Inside the Matrix"
        );
        // user's underlying balance
        uint256 userTokenBalance = IERC20(_underlying).balanceOf(msg.sender);
        // ensure user has enough to send
        //@audit - Just need to check that numTokens is > 0. Although I think adding a minimum buy amount is a good idea
        require(
            userTokenBalance > 0 && numTokens <= userTokenBalance,
            "Insufficient Balance"
        );
        // calculate price change
        uint256 oldPrice = _calculatePrice();
        // previous amount of underlying asset before any are received
        uint256 prevTokenAmount = IERC20(_underlying).balanceOf(address(this));
        // move asset into this contract
        bool success = IERC20(_underlying).transferFrom(
            msg.sender,
            address(this),
            numTokens
        );
        // @audit-ok Immediately check the return value of the transferFrom call
        require(success, "Failure On Token TransferFrom");
        // balance of underlying asset after transfer
        //-------------
        /// @audit - This feels like a shit ton of code for absolutely no gain whatsoever
        uint256 currentTokenAmount = IERC20(_underlying).balanceOf(
            address(this)
        );
        // number of Tokens we have purchased
        uint256 difference = currentTokenAmount - prevTokenAmount;
        // ensure nothing unexpected happened
        require(
            difference <= numTokens && difference > 0,
            "Failure on Token Evaluation"
        );
        // if this is the first purchase, use new amount
        // @audit - check what the fuck does prevTokenAmount do besides just exist...
        prevTokenAmount = prevTokenAmount == 0
            ? currentTokenAmount
            : prevTokenAmount;
        //-------------

        // Emit Staked
        emit TokenStaked(difference, recipient);
        // Handle Minting @audit - check the handle minting process here
        return _handleMinting(recipient, difference, prevTokenAmount, oldPrice);
    }

    /** Sells CLIMB Tokens And Deposits Underlying Asset Tokens into Recipients's Address */
    function _sell(uint256 tokenAmount, address recipient) internal {
        require(tokenAmount > 0 && _balances[msg.sender] >= tokenAmount);
        // calculate price change
        uint256 oldPrice = _calculatePrice();
        // fee exempt
        bool takeFee = !isFeeExempt[msg.sender];
        uint tokensToSwap;
        // tokens post fee to swap for underlying asset
        if (!takeFee) {
            require(tokenAmount > 100, "Minimum of 100");
            tokensToSwap = tokenAmount - 100;
        } else tokensToSwap = (tokenAmount * (sellFee)) / feeDenominator;

        // value of taxed tokens
        uint256 amountUnderlyingAsset = (tokensToSwap * oldPrice) / precision;
        // require above zero value
        require(
            amountUnderlyingAsset > 0,
            "Zero Assets To Redeem For Given Value"
        );

        // burn from sender + supply
        _burn(msg.sender, tokenAmount);

        if (takeFee) {
            // difference
            uint256 taxTaken = tokenAmount - tokensToSwap;
            // allocate dev share
            uint256 allocation = (taxTaken * devShare) /
                (devShare + liquidityShare);
            // mint to dev
            _mint(dev, allocation);
        }

        // send Tokens to Seller
        bool successful = IERC20(_underlying).transfer(
            recipient,
            amountUnderlyingAsset
        );
        // ensure Tokens were delivered
        require(successful, "Underlying Asset Transfer Failure");
        // Requires The Price of CLIMB to Increase in order to complete the transaction
        _requirePriceRises(oldPrice);
        // Differentiate Sell
        emit TokenSold(tokenAmount, amountUnderlyingAsset, recipient);
    }

    /** Handles Minting Logic To Create New Tokens*/
    function _handleMinting(
        address recipient,
        uint256 received,
        uint256 prevTokenAmount,
        uint256 oldPrice
    ) private returns (bool) {
        // fee exempt
        bool takeFee = !isFeeExempt[msg.sender];

        // find the number of tokens we should mint to keep up with the current price
        /// @audit - CLIMB_SUPPLY * USDT RECEIVED / USDT PREVIOUSLY HELD
        uint256 tokensToMintNoTax = (totalSupply * received) / prevTokenAmount;

        // apply fee to minted tokens to inflate price relative to total supply
        uint256 tokensToMint = takeFee
            ? (tokensToMintNoTax * mintFee) / feeDenominator // @audit-ok - check the comments for fees, since they're BS
            : tokensToMintNoTax - 100;

        /// @audit - This is an unnecesary check, check should be "received > 0" if < 100 it should revert on it's own
        // revert if under 1
        require(tokensToMint > 0, "Must Purchase At Least One Climb Token");

        if (takeFee) {
            // @audit come back to this since it's very confusing, What does the devshare have to do with the liquidityshare?
            // difference
            uint256 taxTaken = tokensToMintNoTax - tokensToMint; // @audit-ok - ok so this is why the fee is reversed to 95% instead of it being 5%
            // allocate dev share
            // @audit - honestly what a fucking roundabout way of taking 1% of fees can definitely improve this.
            uint256 allocation = (taxTaken * devShare) /
                (devShare + liquidityShare);
            // mint to dev
            _mint(dev, allocation);
        }

        // mint to Buyer
        _mint(recipient, tokensToMint);
        // Requires The Price of CLIMB to Increase in order to complete the transaction
        _requirePriceRises(oldPrice);
        return true;
    }

    /** Mints Tokens to the Receivers Address */
    /// TODO SIGH SO MUCH SAFEMATH
    function _mint(address receiver, uint256 amount) private {
        _balances[receiver] = _balances[receiver] + amount;
        totalSupply = totalSupply + amount;
        /// @audit - dafuq is _volumeFor?
        _volumeFor[receiver] += amount;
        emit Transfer(address(0), receiver, amount);
    }

    /** Burns Tokens from the Receivers Address */
    function _burn(address receiver, uint256 amount) private {
        require(_balances[receiver] >= amount, "Insufficient Balance");
        _balances[receiver] -= amount;
        totalSupply -= amount;
        _volumeFor[receiver] += amount;
        emit Transfer(receiver, address(0), amount);
    }

    /** Make Sure there's no Native Tokens in contract */
    function _checkGarbageCollector() internal {
        uint256 bal = _balances[address(this)];
        if (bal > 10) {
            // Track Change In Price
            uint256 oldPrice = _calculatePrice();
            // burn amount
            _burn(address(this), bal);
            // Emit Collection
            emit GarbageCollected(bal);
            // Emit Price Difference
            emit PriceChange(oldPrice, _calculatePrice(), totalSupply);
        }
    }

    ///////////////////////////////////
    //////    READ FUNCTIONS    ///////
    ///////////////////////////////////

    /** Returns the Owner of the Contract */
    function owner() external view returns (address) {
        return _owner;
    }

    /** Price Of CLIMB in BUSD With 18 Points Of Precision */
    function calculatePrice() external view returns (uint256) {
        return _calculatePrice();
    }

    /** Precision Of $0.001 */
    function price() external view returns (uint256) {
        return (_calculatePrice() * 10 ** 3) / precision;
    }

    /** Returns the Current Price of 1 Token */
    function _calculatePrice() internal view returns (uint256) {
        uint256 tokenBalance = IERC20(_underlying).balanceOf(address(this));
        return (tokenBalance * precision) / totalSupply;
    }

    /** Returns the value of your holdings before the sell fee */
    function getValueOfHoldings(address holder) public view returns (uint256) {
        return (_balances[holder] * _calculatePrice()) / precision;
    }

    /** Returns the value of your holdings after the sell fee */
    function getValueOfHoldingsAfterTax(
        address holder
    ) external view returns (uint256) {
        return (getValueOfHoldings(holder) * sellFee) / feeDenominator;
    }

    /** Returns The Address of the Underlying Asset */
    function getUnderlyingAsset() external pure returns (address) {
        return _underlying;
    }

    /** Volume in CLIMB For A Particular Wallet */
    function volumeFor(address wallet) external view returns (uint256) {
        return _volumeFor[wallet];
    }

    ///////////////////////////////////
    //////   OWNER FUNCTIONS    ///////
    ///////////////////////////////////

    /** Enables Trading For This Token, This Action Cannot be Undone */
    function ActivateToken() external onlyOwner {
        require(!Token_Activated, "Already Activated Token");
        Token_Activated = true;
        emit TokenActivated(totalSupply, _calculatePrice(), block.timestamp);
    }

    /** Excludes Contract From Fees */
    function setFeeExemption(address Contract, bool exempt) external onlyOwner {
        require(Contract != address(0));
        isFeeExempt[Contract] = exempt;
        emit SetFeeExemption(Contract, exempt);
    }

    /** Set Matrix Contract */
    function setMatrixContract(
        address newMatrix,
        bool exempt
    ) external onlyOwner {
        require(newMatrix != address(0));
        isMatrix[newMatrix] = exempt;
        emit SetMatrixContract(newMatrix, exempt);
    }

    /** Updates The Threshold To Trigger The Garbage Collector */
    function changeTokenSlippage(uint256 newSlippage) external onlyOwner {
        require(newSlippage <= 995, "invalid slippage");
        _tokenSlippage = newSlippage;
        emit UpdateTokenSlippage(newSlippage);
    }

    /** Updates The devShare and liquidityShare */
    function updateShares(
        uint256 newDevShare,
        uint256 newLiquidityShare
    ) external onlyOwner {
        require(newDevShare + newLiquidityShare <= 995, "invalid shares");
        devShare = newDevShare;
        liquidityShare = newLiquidityShare;
        emit UpdateShares(devShare, liquidityShare);
    }

    /** Updates The dev Address */
    function updateDevAddress(address newDev) external onlyOwner {
        require(newDev != address(0));
        dev = newDev;
        emit UpdateDevAddress(newDev);
    }

    /** Updates The Sell, Mint, and Transfer Fees */
    function updateFees(
        uint256 newSellFee,
        uint256 newMintFee,
        uint256 newTransferFee
    ) external onlyOwner {
        require(
            newSellFee <= 995 && newMintFee <= 995 && newTransferFee <= 995,
            "invalid fees"
        );
        sellFee = newSellFee;
        mintFee = newMintFee;
        transferFee = newTransferFee;
        emit UpdateFees(sellFee, mintFee, transferFee);
    }

    /** Transfers Ownership To Another User */
    function transferOwnership(address newOwner) external onlyOwner {
        _owner = newOwner;
        emit TransferOwnership(newOwner);
    }

    /** Transfers Ownership To Zero Address */
    function renounceOwnership() external onlyOwner {
        _owner = address(0);
        emit TransferOwnership(address(0));
    }

    /** Mint Tokens to Buyer */
    receive() external payable {
        _checkGarbageCollector();
        _purchase(msg.sender);
    }

    ///////////////////////////////////
    //////        EVENTS        ///////
    ///////////////////////////////////

    event UpdateShares(uint256 updatedDevShare, uint256 updatedLiquidityShare);
    event UpdateFees(
        uint256 updatedSellFee,
        uint256 updatedMintFee,
        uint256 updatedTransferFee
    );
    event UpdateDevAddress(address updatedDev);
    event SetMatrixContract(address newMatrix, bool exempt);
    event PriceChange(
        uint256 previousPrice,
        uint256 currentPrice,
        uint256 totalSupply
    );
    event ErasedHoldings(address who, uint256 amountTokensErased);
    event GarbageCollected(uint256 amountTokensErased);
    event UpdateTokenSlippage(uint256 newSlippage);
    event TransferOwnership(address newOwner);
    event TokenStaked(uint256 assetsReceived, address recipient);
    event SetFeeExemption(address Contract, bool exempt);
    event TokenActivated(uint256 totalSupply, uint256 price, uint256 timestamp);
    event TokenSold(
        uint256 amountCLIMB,
        uint256 assetsRedeemed,
        address recipient
    );
    event TokenPurchased(uint256 assetsReceived, address recipient);
}
