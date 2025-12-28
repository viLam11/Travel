// src/components/charts/PopularDestinationsChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin } from 'lucide-react';
import type { PopularDestination } from '@/data/dashboardData';

interface PopularDestinationsChartProps {
  data: PopularDestination[];
}

export default function PopularDestinationsChart({ data }: PopularDestinationsChartProps) {
  // Using admin theme colors
  const COLORS = [
    'rgb(30, 157, 241)',    // --chart-1 (Blue)
    'rgb(0, 184, 122)',     // --chart-2 (Green)
    'rgb(247, 185, 40)',    // --chart-3 (Yellow)
    'rgb(23, 191, 99)',     // --chart-4 (Green variant)
    'rgb(224, 36, 94)',     // --chart-5 (Pink)
  ];

  const totalBookings = data.reduce((acc, curr) => acc + curr.bookings, 0);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-chart-1" />
          <div>
            <CardTitle className="text-lg font-semibold">Popular Destinations</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Top 5 locations</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="bookings"
              label={({ percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} bookings (${props.payload.percentage}%)`, 
                props.payload.destination
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

        {/* Destinations List */}
        <div className="space-y-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{item.destination}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{item.bookings}</span>
                <span className="text-xs text-muted-foreground ml-1">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">Total Destinations</p>
          <p className="text-2xl font-bold text-chart-1">{totalBookings}</p>
        </div>
      </CardContent>
    </Card>
  );
}