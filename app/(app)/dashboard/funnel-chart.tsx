"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type FunnelChartProps = {
  data: { stage: string; count: number }[];
};

// Gradient colors from orange to teal matching the theme
const COLORS = [
  "#f59e0b", // amber-500 - Applied
  "#f97316", // orange-500 - Screening
  "#06b6d4", // cyan-500 - Interview
  "#0ea5e9", // sky-500 - Final
  "#10b981", // emerald-500 - Offer
];

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={80}
          tick={{ fontSize: 12, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="font-medium text-popover-foreground">{payload[0].payload.stage}</p>
                  <p className="text-sm text-muted-foreground">
                    {payload[0].value} applications
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
