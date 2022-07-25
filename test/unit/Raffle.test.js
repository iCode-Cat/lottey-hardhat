const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
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

          describe("constructor", function () {
              it("Initilializes the raffle correctly", async function () {
                  // Ideally we make our tests have just 1 assert per "it"
                  const raffleState = await raffle.getRaffleState()

                  assert.equal(raffleState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })

          describe("enterRaffle", () => {
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
          describe("checkUpkeep", function () {
              it("returns false if people haven't sent any ETH", async function () {
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([])
                  assert(!upkeepNeeded)
              })

              it("returns false if raffle isn't open", async function () {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  await raffle.performUpkeep([]) // changes the state to calculating
                  const raffleState = await raffle.getRaffleState() // stores the new state
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert.equal(raffleState.toString() == "1", upkeepNeeded == false)
              })
              it("returns false if enough time hasn't passed", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() - 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(!upkeepNeeded)
              })
              it("returns true if enough time has passed, has players, eth, and is open", async () => {
                  await raffle.enterRaffle({ value: entranceFee })
                  await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                  await network.provider.request({ method: "evm_mine", params: [] })
                  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x") // upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers)
                  assert(upkeepNeeded)
              })
              describe("performUpkeep", function () {
                  it("it can only run if checkupkeep is true", async function () {
                      await raffle.enterRaffle({
                          value: entranceFee,
                      })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      const tx = await raffle.performUpkeep([])
                  })
                  it("reverts when checkupkeep is false", async function () {
                      await expect(raffle.performUpkeep([])).to.be.revertedWith(
                          "Raffle__UpkeepNotNeeded"
                      )
                  })
                  it("updates the raffle,emits an event, and calls the VRF coordinator", async function () {
                      await raffle.enterRaffle({
                          value: entranceFee,
                      })
                      await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
                      await network.provider.send("evm_mine", [])
                      const txResponse = await raffle.performUpkeep([])
                      const txReceipt = await txResponse.wait(1)
                      const requestId = txReceipt.events[1].args.requestId
                      const raffleState = await raffle.getRaffleState()
                      assert(requestId.toNumber() > 0)
                      assert(raffleState.toString() == "1")
                  })
              })
          })
          describe("fullfillRandomWords", function () {
              beforeEach(async function () {
                  await raffle.enterRaffle({
                      value: entranceFee,
                  })
                  await network.provider.send("evm_increase_time", [interval.toNumber() + 1])
                  await network.provider.send("evm_mine", [])
              })
          })
      })
