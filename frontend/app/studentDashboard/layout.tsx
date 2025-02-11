'use client'
import { Bell } from "lucide-react"
import { SidebarNav } from "../__components/student/SideBar"
import { Button } from "@/components/ui/button"
import type React from "react" // Import React

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline">Disconnect</Button>
            <span className="text-sm text-muted-foreground">0x720f...698b</span>
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}

