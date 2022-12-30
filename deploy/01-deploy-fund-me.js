const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //what happens when we want to change chains?
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") //thanks to hardhat-deploy we can just get the most recently deployed
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // When going for localhost or hardhat network we want to use a mock(because they dont have priceFeed on them)
    //If th contract doesn't exist, we deploy a minimal version of it (for our local testing)

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //put price feed address hier (constructor arguments)
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (!developmentChain.includes(network.name) && ETHERSCAN_API_KEY) {
        //verify
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }

    log("--------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
