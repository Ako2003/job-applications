"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type CountryData = {
  country: string;
  count: number;
};

type CountryChartProps = {
  data: CountryData[];
};

const COLORS = [
  "var(--color-primary)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-accent)",
];

export function CountryChart({ data }: CountryChartProps) {
  const chartData = data.map((item) => ({
    name: item.country,
    value: item.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
          }
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              className="stroke-background"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-popover)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-popover-foreground)",
          }}
          formatter={(value) => [`${value} applications`, "Count"]}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "var(--color-foreground)" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
