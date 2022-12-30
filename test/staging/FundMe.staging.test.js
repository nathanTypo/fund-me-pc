const { assert, expect } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

developmentChain.includes(network.name)
    ? describe.skip //we can use message""
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          //we dont need priceFeed since we are acting with an already deploy contract here
          const sendValue = ethers.utils.parseEther("1") // ethers also have a parseUnits function, number to eth, wei, gwei...
          before(async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allow people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.cheaperWithdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
