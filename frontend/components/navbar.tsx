"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/providers/web3-provider"
import { motion } from "framer-motion"
import { Wallet, BadgeCheckIcon as Verify, Book, Grid3X3, Users } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3()
  const [isScrolled, setIsScrolled] = useState(false)

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0)
    })
  }

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
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent"
            >
              Web3 Project
            </Link>
          </div>
        <div className="hidden md:flex items-center space-x-8">
            {/* Fixed Link structure */}
         

            <Link
              href="/"
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

