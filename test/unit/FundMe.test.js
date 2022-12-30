const { assert, expect } = require("chai")
const { deployments, ethers, network, getNamedAccounts } = require("hardhat")
const { developmentChain } = require("../../helper-hardhat-config")

!developmentChain.includes(network.name)
    ? describe.skip //we can use message""
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let mockV3AggregatorAddress
          let accounts // acc1 === deployer

          const sendValue = ethers.utils.parseEther("1") // ethers also have a parseUnits function, number to eth, wei, gwei...
          before(async () => {
              //we used to use getSigners but we want to use the hardhat-deploy option of getting namedAccounts as above
              deployer = (await getNamedAccounts()).deployer
              accounts = await ethers.getSigners() // deployer is same as accounts[0]
              //We need to deploy our FundMe contract,
              //since we are now using Hardhat-deploy it will be used(easier) for our tests
              await deployments.fixture(["all"]) // all(tags) helps us deploy everything in our deploy folder(very practical)
              fundMe = await ethers.getContract("FundMe", deployer) //Get the (most recent deployment) + connect deplyer
              //thanks to hardhat-deploy we can just get the most recently deployed
              const mockV3Aggregator = await deployments.get("MockV3Aggregator")
              //alternatively we can do:
              /*
              const mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
              */
              mockV3AggregatorAddress = mockV3Aggregator.address
          })

          describe("constructor", async () => {
              it("Sets the aggregator addresses corectly", async () => {
                  const response = await fundMe.getPriceFeedAddress()
                  assert.equal(response, mockV3AggregatorAddress)
              })
          })

          //Both receive and fallback are not quite tested yet we just send fund throught metamask to make things simple

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWithCustomError(
                      fundMe,
                      "DidNotSendEnoughEth"
                  )
              })
              it("update the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of funders", async () => {
                  const currentFunder = await fundMe.getFunder(0)
                  assert.equal(currentFunder, deployer)
              })
          })

          describe("withdraw fund from contract", async () => {
              it("withdraw ETH from a single funder", async () => {
                  //Arrange -> Act -> Assert(Expect)
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) //since both are bigNumbers let use the mul(function) to get the total gas cost of this transaction

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert(Expect)
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString() //Its a BigNumber so we use its add function for more security
                  )
                  assert.equal(endingFundMeBalance.toString(), "0")
              })

              it("allows us to withdraw with multiple funders", async () => {
                  //lets connect our others addresses tothis contract
                  //Arrange
                  for (let i = 1; i < 5; i++) {
                      await fundMe.connect(accounts[i]).fund({
                          value: sendValue,
                          from: accounts[i].address,
                      })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //ACT
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) //since both are bigNumbers let use the mul(function) to get the total gas cost of this transaction

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Assert(Expect)
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString() //Its a BigNumber so we use its add function for more security
                  )
                  assert.equal(endingFundMeBalance.toString(), "0")

                  //We also want to make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (i = 1; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allow the owner of this contract to withdraw", async () => {
                  const attacker = accounts[1]
                  await expect(
                      fundMe
                          .connect(attacker)
                          .withdraw({ from: attacker.address })
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })

          describe("cheaperWithdraw testings for gas optimization", async () => {
              it("withdraw ETH from a single funder", async () => {
                  //Arrange -> Act -> Assert(Expect)
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) //since both are bigNumbers let use the mul(function) to get the total gas cost of this transaction

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert(Expect)
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString() //Its a BigNumber so we use its add function for more security
                  )
                  assert.equal(endingFundMeBalance.toString(), "0")
              })

              it("allows us to withdraw with multiple funders", async () => {
                  //lets connect our others addresses tothis contract
                  //Arrange
                  for (let i = 1; i < 5; i++) {
                      await fundMe.connect(accounts[i]).fund({
                          value: sendValue,
                          from: accounts[i].address,
                      })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //ACT
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) //since both are bigNumbers let use the mul(function) to get the total gas cost of this transaction

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)

                  //Assert(Expect)
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString() //Its a BigNumber so we use its add function for more security
                  )
                  assert.equal(endingFundMeBalance.toString(), "0")

                  //We also want to make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  for (i = 1; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allow the owner of this contract to withdraw", async () => {
                  const attacker = accounts[1]
                  await expect(
                      fundMe
                          .connect(attacker)
                          .cheaperWithdraw({ from: attacker.address })
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
