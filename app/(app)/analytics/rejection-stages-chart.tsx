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

type RejectionStagesChartProps = {
  data: { stage: string; count: number }[];
};

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-destructive)",
];

export function RejectionStagesChart({ data }: RejectionStagesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="stage"
          width={100}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value) => [`${value} rejections`, "Count"]}
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
