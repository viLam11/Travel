// src/components/charts/BookingStatusChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { BookingStatus } from '@/data/dashboardData';

interface BookingStatusChartProps {
  data: BookingStatus[];
}

export default function BookingStatusChart({ data }: BookingStatusChartProps) {
  // Using admin theme colors
  const COLORS: { [key: string]: string } = {
    Confirmed: 'rgb(0, 184, 122)',    // --chart-2 (Green)
    Completed: 'rgb(30, 157, 241)',   // --chart-1 (Blue)
    Pending: 'rgb(247, 185, 40)',     // --chart-3 (Yellow)
    Cancelled: 'rgb(244, 33, 46)',    // --destructive (Red)
  };

  const totalBookings = data.reduce((acc, curr) => acc + curr.count, 0);

  const renderCustomLabel = (entry: any) => {
    return `${entry.percentage}%`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Booking Status</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Current distribution</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
          <Pie
            data={data as unknown as { [key: string]: any }[]}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="count"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string, props: any) => [
              `${value} bookings (${props.payload.percentage}%)`, 
              props.payload.status
            ]}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--popover))',
              color: 'hsl(var(--popover-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="space-y-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[item.status] }}
                />
                <span className="text-sm">{item.status}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{item.count}</span>
                <span className="text-xs text-muted-foreground ml-1">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">Total Bookings</p>
          <p className="text-2xl font-bold">{totalBookings}</p>
        </div>
      </CardContent>
    </Card>
  );
}