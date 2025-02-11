"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/providers/web3-provider"
import { motion } from "framer-motion"
import { Wallet, BadgeCheckIcon as Verify, Book } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

// A simple inline SVG logo for ZkCertify
function Logo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007CF0" />
          <stop offset="100%" stopColor="#7928CA" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="40" fill="url(#logoGradient)" />
      <text
        x="50%"
        y="55%"
        textAnchor="middle"
        fill="white"
        fontSize="40"
        fontFamily="sans-serif"
        dy=".3em"
      >
        Z
      </text>
    </svg>
  )
}

export function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3()
  const [isScrolled, setIsScrolled] = useState(false)

  // Use useEffect to add and remove the scroll listener.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Logo />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                ZkCertify
              </span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/docs"
              className="flex items-center space-x-2 text-sm font-medium hover:text-cyber-blue transition-colors"
            >
              <Book className="h-4 w-4" />
              <span>Docs</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/verify">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Verify className="mr-2 h-4 w-4" />
                Verify
              </Button>
            </Link>
            <Button
              onClick={account ? disconnectWallet : connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
