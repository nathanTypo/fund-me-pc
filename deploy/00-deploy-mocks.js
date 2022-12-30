const { network } = require("hardhat")
const {
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks... ")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER], //put constructor arguments for MockV3Aggregator(look in @chainlink in your node-modules)//decimals and initial answer
            log: true,
        })
        log("Mocks deployed!")
        log("--------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
