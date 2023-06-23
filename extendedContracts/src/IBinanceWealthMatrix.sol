//SPDX-License-Identifer: MIT

pragma solidity ^0.8.0;

interface IBinanceWealthMatrix {
    function user(
        address _user
    )
        external
        view
        returns (
            uint256 miners,
            uint256 totalInvested, // This is in CLIMB
            uint256 totalRedeemed, // This is in CLIMB
            uint256 eggsToClaim,
            uint256 lastInteraction,
            address referrer
        );
}
