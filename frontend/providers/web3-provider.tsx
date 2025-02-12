"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ethers } from "ethers"

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: true
      request: (...args: any[]) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

interface Web3ContextType {
  account: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => Promise<void>
  isConnecting: boolean
  chainId: number | null
  provider: ethers.BrowserProvider | null
  isMetaMaskAvailable: boolean
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  connectWallet: async () => {},
  disconnectWallet: async () => {},
  isConnecting: false,
  chainId: null,
  provider: null,
  isMetaMaskAvailable: false,
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMetaMask = () => {
      const hasMetaMask = !!window.ethereum?.isMetaMask
      setIsMetaMaskAvailable(hasMetaMask)
      return hasMetaMask
    }

    checkMetaMask()

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] || null)
    }

    const handleChainChanged = (hexChainId: string) => {
      setChainId(parseInt(hexChainId, 16))
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const connectWallet = async () => {
    if (!isMetaMaskAvailable) {
      alert('Please install MetaMask!')
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts'
      })
      
      const hexChainId = await window.ethereum!.request({
        method: 'eth_chainId'
      })

      setAccount(accounts[0])
      setChainId(parseInt(hexChainId, 16))
      setProvider(new ethers.BrowserProvider(window.ethereum!))
    } catch (error) {
      console.error('Error connecting:', error)
      alert('Failed to connect to MetaMask')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    setAccount(null)
    setChainId(null)
    setProvider(null)
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        connectWallet,
        disconnectWallet,
        isConnecting,
        chainId,
        provider,
        isMetaMaskAvailable,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3 = () => useContext(Web3Context)