// src/components/charts/TopProvidersChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award } from 'lucide-react';
import type { TopProvider } from '@/data/dashboardData';

interface TopProvidersChartProps {
  data: TopProvider[];
}

export default function TopProvidersChart({ data }: TopProvidersChartProps) {
  // Using admin theme colors - alternating between Hotels (Blue) and Tours (Green)
  const getColor = (type: "hotel" | "tour", index: number) => {
    if (type === "hotel") {
      // Blue shades for hotels
      const hotelColors = [
        'rgb(30, 157, 241)',   // Primary
        'rgb(59, 130, 246)',   // Lighter
        'rgb(96, 165, 250)',   // Even lighter
        'rgb(147, 197, 253)',  // Lightest
      ];
      return hotelColors[index % hotelColors.length];
    } else {
      // Green shades for tours
      const tourColors = [
        'rgb(0, 184, 122)',    // Primary green
        'rgb(16, 185, 129)',   // Lighter
        'rgb(52, 211, 153)',   // Even lighter
        'rgb(110, 231, 183)',  // Lightest
      ];
      return tourColors[index % tourColors.length];
    }
  };

  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(1)}k`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-chart-1" />
          <div>
            <CardTitle className="text-lg font-semibold">Top Service Providers</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Best performing partners</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart 
            data={data} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tickFormatter={formatCurrency}
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              type="category"
              dataKey="name" 
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 11 }}
              width={150}
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                return [value, 'Bookings'];
              }}
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
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColor(entry.type, Math.floor(index / 2))} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-chart-1">
              ${data.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
            <p className="text-lg font-bold text-chart-2">
              {data.reduce((acc, curr) => acc + curr.bookings, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}