"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type RejectionsBySourceChartProps = {
  data: {
    source: string;
    total: number;
    rejected: number;
    rate: number;
  }[];
};

export function RejectionsBySourceChart({ data }: RejectionsBySourceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="source"
          width={120}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value, name) => {
            if (name === "total") return [`${value}`, "Total applications"];
            if (name === "rejected") return [`${value}`, "Rejected"];
            return [value, name];
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === "total") return "Total";
            if (value === "rejected") return "Rejected";
            return value;
          }}
        />
        <Bar
          dataKey="total"
          fill="var(--color-muted)"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="rejected"
          fill="var(--color-destructive)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
