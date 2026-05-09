// src/components/charts/BookingTrendsChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin } from 'lucide-react';

interface CityTraffic {
  cityName: string;
  totalVisits: number;
}

interface BookingTrendsChartProps {
  data: CityTraffic[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground shadow-xl rounded-xl px-4 py-3 text-xs z-50 border border-border">
        <p className="font-black mb-2 uppercase tracking-widest text-[10px] text-muted-foreground">{label}</p>
        <div className="flex gap-4 justify-between items-center">
          <span className="font-medium">Lượt truy cập:</span>
          <span className="font-black text-sm text-primary">{payload[0].value.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  const chartData = data.map(item => ({
    name: item.cityName,
    value: item.totalVisits
  })).sort((a, b) => b.value - a.value);

  const totalVisits = chartData.reduce((acc, curr) => acc + curr.value, 0);

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#6366F1', '#8B5CF6', '#EC4899'];


  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Lưu lượng theo thành phố</CardTitle>
            <p className="text-xs font-medium text-muted-foreground mt-1">Phân bố người dùng theo khu vực</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-0.5 tracking-widest">Tổng lượt truy cập</p>
            <p className="text-2xl font-black text-foreground">{totalVisits.toLocaleString()}</p>
            <div className={`flex items-center justify-end gap-1 text-xs font-bold text-primary`}>
              <MapPin className="w-3 h-3" />
              <span>{chartData.length} Thành phố</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider"
              tick={{ dy: 10, fill: 'currentColor' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground font-bold text-[10px]"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar
              dataKey="value"
              radius={[6, 6, 0, 0]}
              barSize={40}
            >
               {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}