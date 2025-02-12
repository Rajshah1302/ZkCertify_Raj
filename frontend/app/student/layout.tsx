'use client'
import { Bell } from "lucide-react"
import { SidebarNav } from "../__components/student/SideBar"
import { Button } from "@/components/ui/button"
import { Wallet, BadgeCheckIcon as Verify, Book } from "lucide-react";
import { useWeb3 } from "@/providers/web3-provider";

import type React from "react" // Import React

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWeb3();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="font-semibold">ZkCertify</span>
        </div>
        <SidebarNav />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex-1" />
          <div className="flex items-center gap-4">
          <Button
              onClick={account ? disconnectWallet : connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-white"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </Button> </div>
        </header>
        {children}
      </div>
    </div>
  )
}

