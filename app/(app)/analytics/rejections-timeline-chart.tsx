"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RejectionsTimelineChartProps = {
  data: { week: string; count: number }[];
};

export function RejectionsTimelineChart({ data }: RejectionsTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="rejectionGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-destructive)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-destructive)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="week"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value) => [`${value} rejections`, "Week of"]}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--color-destructive)"
          fill="url(#rejectionGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
