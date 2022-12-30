const networkConfig = {
    5: {
        name: "goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", //ETH-USD PriceFeed Address on GOERLi Testnet
    },

    1: {
        name: "ethereum",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", //ETH-USD PriceFeed Address on ETHEREUM Mainnet
    },

    80001: {
        name: "mumbai",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A", //ETH-USD PriceFeed Address on MUMBAI Testnet
    },

    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945", //ETH-USD PriceFeed Address on POLYGON Mainnet
    },
}

const developmentChain = ["hardhat", "localhost"]
// For our MockV3Aggregator constructor
const DECIMALS = 8
const INITIAL_ANSWER = 2000 * 1e8

module.exports = {
    networkConfig,
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
}
