// src/components/charts/BookingTrendsChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { BookingTrend } from '@/data/dashboardData';

interface BookingTrendsChartProps {
  data: BookingTrend[];
}

export default function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  // Calculate average and trend
  const avgBookings = Math.round(data.reduce((acc, curr) => acc + curr.bookings, 0) / data.length);
  const firstHalf = data.slice(0, Math.ceil(data.length / 2));
  const secondHalf = data.slice(Math.ceil(data.length / 2));
  const firstAvg = firstHalf.reduce((acc, curr) => acc + curr.bookings, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((acc, curr) => acc + curr.bookings, 0) / secondHalf.length;
  const trendPercentage = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
  const isPositiveTrend = parseFloat(trendPercentage) > 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Booking Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Last 7 days performance</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{avgBookings}</p>
            <div className={`flex items-center gap-1 text-sm ${isPositiveTrend ? 'text-chart-2' : 'text-destructive'}`}>
              <TrendingUp className="w-4 h-4" />
              <span>{isPositiveTrend ? '+' : ''}{trendPercentage}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Bookings']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="rgb(30, 157, 241)" 
              strokeWidth={3}
              dot={{ fill: 'rgb(30, 157, 241)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}