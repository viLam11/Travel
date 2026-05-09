// src/components/charts/MonthlyRevenueChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { MonthlyRevenue } from '@/data/dashboardData';

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
}

export default function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  const chartData = data.map(item => ({
    ...item,
    month: item.month,
    revenue: item.revenue || 0,
    previousYear: item.previousYear || 0
  }));

  // Calculate growth
  const latestMonth = chartData[chartData.length - 1];
  const growth = (latestMonth && latestMonth.previousYear > 0) ? 
    ((latestMonth.revenue - latestMonth.previousYear) / latestMonth.previousYear * 100).toFixed(1) : "0.0";

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold">So sánh doanh thu</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Năm nay so với năm trước</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Tháng hiện tại</p>
              <p className="text-xl font-bold">{formatCurrency(latestMonth?.revenue || 0)}</p>
            </div>
            <div className="flex items-center gap-1 text-chart-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+{growth}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(30, 157, 241)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(30, 157, 241)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPreviousYear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(114, 118, 122)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="rgb(114, 118, 122)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="month" 
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => {
                try {
                  const date = new Date(val);
                  return isNaN(date.getTime()) ? val : `${date.getDate()}/${date.getMonth() + 1}`;
                } catch {
                  return val;
                }
              }}
            />
            <YAxis 
              tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => {
                if (value === 'revenue') return 'Năm hiện tại';
                if (value === 'previousYear') return 'Năm trước';
                return value;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="previousYear" 
              stroke="rgb(114, 118, 122)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPreviousYear)" 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="rgb(30, 157, 241)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
            <p className="text-lg font-bold text-chart-1">
              {formatCurrency(chartData.reduce((acc, curr) => acc + curr.revenue, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Năm trước</p>
            <p className="text-lg font-bold text-muted-foreground">
              {formatCurrency(chartData.reduce((acc, curr) => acc + curr.previousYear, 0))}
            </p>
          </div>
          <div className="text-center col-span-2 md:col-span-1">
            <p className="text-xs text-muted-foreground">Tăng trưởng chung</p>
            <p className="text-lg font-bold text-chart-2">+{growth}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}