const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", async function () {
          let raffle, vrfCoordinatorV2Mock, entranceFee, deployer, interval
          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              raffle = await ethers.getContract("Raffle", deployer)
              interval = await raffle.getInterval()
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              entranceFee = await raffle.getEntranceFee()
          })

          describe("constructor", async function () {
              it("Initilializes the raffle correctly", async function () {
                  // Ideally we make our tests have just 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()

                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffle", async () => {
              it("reverts when you don't pay enough", async () => {
                  // get enterance fee

                  await expect(raffle.enterRaffle()).to.be.revertedWith(
                      "Raffle__SendMoreToEnterRaffle"
                  )
              })

              it("records players when they enter", async () => {
                  await raffle.enterRaffle({
                      value: entranceFee,
                  })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async () => {
                  await expect(
                      await raffle.enterRaffle({
                          value: entranceFee,
                      })
                  ).to.emit(raffle, "RaffleEnter")
              })
              it("doesnt allow entrance when raffle is calculating", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  // Increase time
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  // we pretend to be a ChainLink Keeper
                  await raffle.performUpkeep([])
                  await expect(
                      raffle.enterRaffle({
                          value: entranceFee,
                      })
                  ).to.be.revertedWith("Raffle__RaffleNotOpen()")
              })
          })
          describe("checkUpkeep", async function () {
              it("returns false if people haven't sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })
          })
      })
