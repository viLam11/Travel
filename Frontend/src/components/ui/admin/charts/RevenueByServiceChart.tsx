// src/components/charts/RevenueByServiceChart.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { RevenueByService } from '@/data/dashboardData';

interface RevenueByServiceChartProps {
  data: RevenueByService[];
}

type TimeRange = 'week' | 'month' | 'year';

export default function RevenueByServiceChart({ data: initialData }: RevenueByServiceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // --- 1. Cấu hình màu sắc & Format ---
  const serviceColors: { [key: string]: string } = {
    'Hotels': 'rgb(30, 157, 241)',
    'Tours': 'rgb(0, 184, 122)',
  };

  const serviceNames: { [key: string]: string } = {
    'Hotels': 'Khách sạn',
    'Tours': 'Vé tham quan',
  };

  // Format số tiền rút gọn (VD: 2.5 Tỷ)
  const formatShortCurrency = (value: number) => {
    if (value === 0) return '0';
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)} T`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)} Tr`;
    return value.toLocaleString();
  };

  const formatFullCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // --- 2. Xử lý dữ liệu ---
  const getProcessedData = () => {
    const multiplier = timeRange === 'week' ? 0.25 : timeRange === 'year' ? 12 : 1;
    return initialData.map(item => ({
      ...item,
      revenue: item.revenue * multiplier,
      bookings: Math.round(item.bookings * multiplier),
      displayService: serviceNames[item.service] || item.service,
      fill: serviceColors[item.service] || 'rgb(114, 118, 122)',
    }));
  };

  const chartData = getProcessedData();

  // --- 3. Component Tùy chỉnh cho Trục X ---
  // Component này sẽ vẽ 3 dòng chữ dưới mỗi cột
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    // Tìm dữ liệu tương ứng với cột này dựa trên tên (payload.value)
    const dataItem = chartData.find(d => d.displayService === payload.value);

    if (!dataItem) return null;

    return (
      <g transform={`translate(${x},${y})`}>
        {/* Dòng 1: Tên dịch vụ */}
        <text x={0} y={0} dy={16} textAnchor="middle" className="text-xs font-semibold fill-foreground">
          {payload.value}
        </text>
        
        {/* Dòng 2: Doanh thu (Màu đậm) */}
        <text x={0} y={0} dy={34} textAnchor="middle" className="text-xs font-bold fill-primary" style={{ fill: dataItem.fill }}>
          {formatFullCurrency(dataItem.revenue)}
        </text>

        {/* Dòng 3: Số đơn (Màu xám) */}
        <text x={0} y={0} dy={50} textAnchor="middle" className="text-[10px] fill-muted-foreground">
          ({dataItem.bookings} đơn)
        </text>
      </g>
    );
  };

  const titles = {
    week: 'Doanh thu Tuần này',
    month: 'Doanh thu Tháng này',
    year: 'Doanh thu Năm nay',
  };

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-semibold">{titles[timeRange]}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">So sánh hiệu quả kinh doanh</p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-lg border border-border">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-background shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === 'week' ? 'Tuần' : range === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={320}>
          {/* Tăng margin bottom để không bị cắt chữ */}
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            
            <XAxis 
              dataKey="displayService" 
              axisLine={false}
              tickLine={false}
              interval={0}       // Bắt buộc hiển thị tất cả các nhãn
              height={70}        // Tăng chiều cao trục X để chứa đủ 3 dòng chữ
              tick={<CustomXAxisTick />} // Sử dụng component tùy chỉnh
            />
            
            <YAxis 
              tickFormatter={formatShortCurrency}
              className="text-muted-foreground text-xs"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              formatter={(value: number) => [formatFullCurrency(value), 'Doanh thu']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))',
                color: 'hsl(var(--popover-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            
            <Bar 
              dataKey="revenue" 
              radius={[6, 6, 0, 0]}
              maxBarSize={80}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}