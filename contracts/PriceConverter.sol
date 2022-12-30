// SPDX-License-Identifier: MIT
//https://solidity-by-example.org/library/

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    //Note make all the function internal

    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // Now getting price of Eth in terms of USD 8 decimal while msg.value is 18 decimal we need to get them to match up
        // 1214.19296102
        return uint256(price * 1e10); //10 zero to get the match to 18 decimals like eth
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        //ethPrice(18decimal) + ethAmount(18 decimal) = 36 decimals that's why we divide it 1e18 to maintain 18 decimal back
        return ethAmountInUsd;
    }

    function getVersion(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        return priceFeed.version();
    }
}
