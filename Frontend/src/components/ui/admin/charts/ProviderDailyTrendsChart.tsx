// src/components/ui/admin/charts/ProviderDailyTrendsChart.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/admin/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyTrendPoint {
  date: string;    // e.g. "15/04"
  bookings: number;
}

interface ProviderDailyTrendsChartProps {
  data: DailyTrendPoint[];
  /** 'place' shows "Lượt đặt vé", 'hotel' shows "Lượt đặt phòng" */
  providerType?: 'hotel' | 'place';
}

type TimeRange = 'week' | 'month';

const ACCENT_COLOR = 'rgb(30, 157, 241)';

const CustomTooltip = ({ active, payload, label, providerType }: any) => {
  if (active && payload && payload.length) {
    const entryLabel = providerType === 'hotel' ? 'Lượt đặt phòng' : 'Lượt đặt vé';
    return (
      <div className="bg-primary text-white shadow-lg rounded-md px-3 py-2 text-xs z-50 min-w-[140px]">
        <p className="font-semibold mb-1 opacity-90">{label}</p>
        <div className="flex gap-2 justify-between items-center">
          <span>{entryLabel}:</span>
          <span className="font-bold text-sm">{(payload[0].value as number).toLocaleString('vi-VN')}</span>
        </div>
      </div>
    );
  }
  return null;
};

/** Generate last N days as placeholder (all 0) so axes always render when no real data */
function generatePlaceholder(days: number): DailyTrendPoint[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: `${d.getDate()}/${d.getMonth() + 1}`, bookings: 0 };
  });
}

export default function ProviderDailyTrendsChart({ data, providerType = 'place' }: ProviderDailyTrendsChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const chartLabel = providerType === 'hotel' ? 'Xu hướng đặt phòng' : 'Xu hướng đặt vé';
  const subLabel = providerType === 'hotel' ? 'Lượt đặt phòng theo ngày' : 'Lượt đặt vé theo ngày';

  const visibleData = useMemo(() => {
    const sliced = timeRange === 'week' ? data.slice(-7) : data;
    return sliced.length > 0 ? sliced : generatePlaceholder(timeRange === 'week' ? 7 : 30);
  }, [data, timeRange]);

  return (
    <Card className="border-0 shadow-sm h-full flex flex-col min-w-[280px]">
      <CardHeader className="pb-4">
        {/* Row 1: title + toggle button on same line */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg font-semibold">{chartLabel}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{subLabel}</p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-lg border border-border shrink-0 self-start">
            {(['week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={280}>
          <AreaChart data={visibleData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="providerTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ACCENT_COLOR} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ACCENT_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              interval={timeRange === 'week' ? 0 : 'preserveStartEnd'}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              width={32}
              allowDecimals={false}
            />

            <Tooltip
              content={<CustomTooltip providerType={providerType} />}
              cursor={{ stroke: ACCENT_COLOR, strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="bookings"
              stroke={ACCENT_COLOR}
              strokeWidth={2.5}
              fill="url(#providerTrendFill)"
              dot={false}
              activeDot={{ r: 5, fill: ACCENT_COLOR, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
