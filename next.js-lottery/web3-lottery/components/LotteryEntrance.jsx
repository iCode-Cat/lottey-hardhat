/*eslint-disable*/
import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis, useMoralisWeb3Api } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useNotification } from "@web3uikit/core"

const LotteryEntrance = () => {
    const Web3Api = useMoralisWeb3Api()

    const [enteranceFee, setEntranceFee] = useState("0")
    const [numPlayer, setNumPlayer] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const { chainId: chainIdHex, isWeb3Enabled, Moralis } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const dispatch = useNotification()

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })

    const {
        runContractFunction: enterRaffle,
        data: enterTxResponse,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: "100000000000000001",
        params: {},
    })

    const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeAmount = (await getEntranceFee())?.toString()
        const numPlayersFromCall = (await getNumberOfPlayers())?.toString()
        const recentWinnerFromCall = await getRecentWinner()

        setEntranceFee(entranceFeeAmount)
        setNumPlayer(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Tx Notification",
            position: "topR",
            // icon: "check",
        })
    }

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }
    //
    return (
        <div>
            {raffleAddress ? (
                <div>
                    <button
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                            })
                        }}
                    >
                        Enter Raffle
                    </button>
                    LotteryEntrance:{" "}
                    <div>
                        {ethers.utils.formatUnits(enteranceFee, "ether")} ETH
                        <div>Number Of Players {numPlayer}</div>
                        <div>Recent Winner {recentWinner}</div>
                    </div>
                </div>
            ) : (
                "No Raffle Address"
            )}
        </div>
    )
}

export default LotteryEntrance
