import React from "react"
import { ConnectWallet } from "@web3uikit/web3"

const Header = () => {
    return (
        <div>
            Decentralized Lottery
            <ConnectWallet moralisAuth={false} />
        </div>
    )
}

export default Header
