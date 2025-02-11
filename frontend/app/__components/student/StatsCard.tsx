import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react" // Import React

interface StatsCardProps {
  title: string
  value: string
  change?: string
  icon?: React.ReactNode
  subtitle?: string
}

export function StatsCard({ title, value, change, icon, subtitle }: StatsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change || subtitle) && (
          <p className="text-xs text-muted-foreground">
            {change && <span className="text-green-500">{change}</span>}
            {subtitle && <span className="ml-2">{subtitle}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

