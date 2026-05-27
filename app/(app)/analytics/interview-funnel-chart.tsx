"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

type InterviewFunnelChartProps = {
  data: {
    stage: string;
    count: number;
  }[];
};

const STAGE_COLORS = [
  "var(--color-muted-foreground)",
  "var(--color-chart-3)",
  "var(--color-chart-2)",
  "var(--color-primary)",
];

export function InterviewFunnelChart({ data }: InterviewFunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="stage"
          width={80}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          labelStyle={{ color: "var(--color-popover-foreground)" }}
          itemStyle={{ color: "var(--color-popover-foreground)" }}
          formatter={(value) => [`${value}`, "Applications"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={STAGE_COLORS[index % STAGE_COLORS.length]}
            />
          ))}
          <LabelList
            dataKey="count"
            position="right"
            fill="var(--color-foreground)"
            fontSize={12}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
