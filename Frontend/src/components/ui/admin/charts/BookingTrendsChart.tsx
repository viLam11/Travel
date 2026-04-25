// src/components/charts/BookingTrendsChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { BookingTrend } from '@/data/dashboardData';

interface BookingTrendsChartProps {
  data: BookingTrend[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-primary text-white shadow-lg rounded-md px-3 py-2 text-xs z-50 min-w-[120px]">
        <p className="font-semibold mb-1 opacity-90">{label}</p>
        <div className="flex gap-2 justify-between items-center">
          <span>Tổng đặt vé:</span>
          <span className="font-bold text-sm">{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  // Calculate average and trend
  const hasData = data && data.length > 0;
  const avgBookings = hasData
    ? Math.round(data.reduce((acc, curr) => acc + curr.bookings, 0) / data.length)
    : 0;

  let trendPercentage = "0.0";
  let isPositiveTrend = true;

  if (hasData && data.length >= 2) {
    const firstHalf = data.slice(0, Math.ceil(data.length / 2));
    const secondHalf = data.slice(Math.ceil(data.length / 2));
    const firstAvg = firstHalf.reduce((acc, curr) => acc + curr.bookings, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, curr) => acc + curr.bookings, 0) / secondHalf.length;

    if (firstAvg > 0) {
      trendPercentage = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
    } else if (secondAvg > 0) {
      trendPercentage = "100.0";
    }
    isPositiveTrend = parseFloat(trendPercentage) >= 0;
  }


  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Booking Trends</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Last 7 days performance</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] text-muted-foreground mb-0.5">Tổng đặt vé</p>
            <p className="text-2xl font-bold">{avgBookings}</p>
            <div className={`flex items-center justify-end gap-1 text-sm ${isPositiveTrend ? 'text-chart-2' : 'text-destructive'}`}>
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
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
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