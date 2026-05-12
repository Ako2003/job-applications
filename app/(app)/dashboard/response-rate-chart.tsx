"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ResponseRateChartProps = {
  data: { name: string; total: number; responses: number; rate: number }[];
};

// Theme colors
const MUTED_COLOR = "#3f3f46"; // zinc-700
const PRIMARY_COLOR = "#f59e0b"; // amber-500

export function ResponseRateChart({ data }: ResponseRateChartProps) {
  // Take top 5 only
  const chartData = data.slice(0, 5);

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                    <p className="font-medium text-popover-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.responses} of {item.total} ({item.rate}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar
            dataKey="total"
            fill={MUTED_COLOR}
            radius={[0, 4, 4, 0]}
            name="Total"
          />
          <Bar
            dataKey="responses"
            fill={PRIMARY_COLOR}
            radius={[0, 4, 4, 0]}
            name="Responses"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: MUTED_COLOR }} />
          <span className="text-muted-foreground">Total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded" style={{ backgroundColor: PRIMARY_COLOR }} />
          <span className="text-muted-foreground">Responses</span>
        </div>
      </div>
    </div>
  );
}
