"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimeToRejectionChartProps = {
  data: { range: string; count: number }[];
};

export function TimeToRejectionChart({ data }: TimeToRejectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis
          dataKey="range"
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value) => [`${value} rejections`, "Count"]}
        />
        <Bar
          dataKey="count"
          fill="var(--color-destructive)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
