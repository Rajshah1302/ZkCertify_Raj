"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base"
import { OpenloginAdapter } from "@web3auth/openlogin-adapter"

const SUPPORTED_NETWORKS = {
  opencampus: {
    chainId: "0x2710", // 10000 in decimal
    displayName: "Open Campus Testnet",
    rpcTarget: "https://testnet.edu.ethereumws.com",
    blockExplorer: "https://testnet.eduversescan.io",
    ticker: "EDU",
    tickerName: "EDU",
  },
  arbitrumTestnet: {
    chainId: "0x66EEE", // 421613 in decimal
    displayName: "Arbitrum Sepolia",
    rpcTarget: "https://sepolia-rollup.arbitrum.io/rpc",
    blockExplorer: "https://sepolia.arbiscan.io",
    ticker: "ETH",
    tickerName: "ETH",
  },
}

interface Web3ContextType {
  account: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isConnecting: boolean
  chainId: number | null
  web3auth: Web3Auth | null
  provider: IProvider | null
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isConnecting: false,
  chainId: null,
  web3auth: null,
  provider: null,
})
const clientId ="BKIBlAyPdcCrCDvrqd0G1ADyl9jcJM1t6fcmxuuZY9xr81RW7hZD-BavrSOXX7J51ieFwSk6LfsCAH1QfON92PM"

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const [provider, setProvider] = useState<IProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        // IMPORTANT: Replace "YOUR_CLIENT_ID" with your actual client ID from Web3Auth Dashboard
        const web3authInstance = new Web3Auth({
          authConfig: {
            clientId,
          },
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: SUPPORTED_NETWORKS.opencampus.chainId,
            rpcTarget: SUPPORTED_NETWORKS.opencampus.rpcTarget,
            displayName: SUPPORTED_NETWORKS.opencampus.displayName,
            blockExplorer: SUPPORTED_NETWORKS.opencampus.blockExplorer,
            ticker: SUPPORTED_NETWORKS.opencampus.ticker,
            tickerName: SUPPORTED_NETWORKS.opencampus.tickerName,
          },
        })

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: "testnet",
            uxMode: "popup",
          },
        })
        web3authInstance.configureAdapter(openloginAdapter)

        setWeb3auth(web3authInstance)
        await web3authInstance.initModal()
        console.log("Web3Auth initialized:", web3authInstance.provider)

        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider)
        } else {
          console.warn("Web3Auth provider not found after initModal")
        }
      } catch (error) {
        console.error("Failed to initialize Web3Auth:", error)
      }
    }

    init()
  }, [])

  const connectWallet = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized")
      return
    }
    setIsConnecting(true)
    try {
      const web3authProvider = await web3auth.connect()
      setProvider(web3authProvider)
      if (web3authProvider) {
        const ethersProvider = new ethers.BrowserProvider(web3authProvider)
        const signer = await ethersProvider.getSigner()
        const address = await signer.getAddress()
        setAccount(address)
        const network = await ethersProvider.getNetwork()
        setChainId(Number(network.chainId))
      }
    } catch (error) {
      console.error("Error connecting:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized")
      return
    }
    try {
      await web3auth.logout()
      setProvider(null)
      setAccount(null)
      setChainId(null)
    } catch (error) {
      console.error("Error disconnecting:", error)
    }
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chainId,
        web3auth,
        provider,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)
