/* eslint-disable */
import { useEffect } from "react"
import { useMoralis } from "react-moralis"

const ManualHeader = () => {
    // const [accountConnected, setAccountConnected] = useState(false)
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()

    useEffect(() => {
        if (isWeb3Enabled) return
        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) {
                enableWeb3()
            }
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        Moralis.onAccountChanged((account) => {
            console.log("Account changed", account)
            if (account === null) {
                window.localStorage.removeItem("connected")
                deactivateWeb3()
                console.log("Null account")
            }
        })
    }, [])

    return (
        <div>
            {account ? (
                <div>Connected to {account.slice(0, 6)}...</div>
            ) : (
                <button
                    disabled={isWeb3EnableLoading}
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                >
                    Connect
                </button>
            )}
        </div>
    )
}

export default ManualHeader
