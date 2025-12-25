"use client"

import { Card, CardContent } from "@/components/ui/admin/card"

interface StatCardProps {
  stat: {
    title: string
    value: string
    icon: any
    color: string
    iconBg: string
  }
}

export function StatsCard({ stat }: StatCardProps) {
  const Icon = stat.icon

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
          <div className={`${stat.iconBg} p-3 rounded-xl`}>
            <Icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
