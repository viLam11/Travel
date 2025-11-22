// src/components/charts/RevenueByServiceChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RevenueByService } from '@/data/dashboardData';

interface RevenueByServiceChartProps {
  data: RevenueByService[];
}

export default function RevenueByServiceChart({ data }: RevenueByServiceChartProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  // Using admin theme colors
  const serviceColors: { [key: string]: string } = {
    Hotels: 'rgb(30, 157, 241)',      // --chart-1 (Primary Blue)
    Tours: 'rgb(0, 184, 122)',        // --chart-2 (Green)
  };

  const chartData = data.map(item => ({
    ...item,
    fill: serviceColors[item.service] || 'rgb(114, 118, 122)',
  }));

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Revenue by Service Type</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Total revenue comparison across services</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="service" 
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Bar 
              dataKey="revenue" 
              radius={[8, 8, 0, 0]}
              maxBarSize={100}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: serviceColors[item.service] }}
              />
              <p className="text-xs text-muted-foreground">{item.service}</p>
              <p className="text-sm font-semibold">{item.bookings} bookings</p>
              <p className="text-xs text-muted-foreground mt-1">${item.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}