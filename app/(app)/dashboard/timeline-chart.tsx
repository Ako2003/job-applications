"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TimelineChartProps = {
  data: { week: string; count: number }[];
};

// Orange theme color
const PRIMARY_COLOR = "#f59e0b";
const PRIMARY_COLOR_FADED = "rgba(245, 158, 11, 0.2)";

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ left: 0, right: 0 }}>
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#a1a1aa" }}
          tickLine={false}
          axisLine={false}
          width={30}
        />
        <Tooltip
          cursor={{ stroke: "rgba(255, 255, 255, 0.1)", strokeWidth: 1 }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                  <p className="font-medium text-popover-foreground">Week of {payload[0].payload.week}</p>
                  <p className="text-sm text-muted-foreground">
                    {payload[0].value} applications
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke={PRIMARY_COLOR}
          fill={PRIMARY_COLOR_FADED}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
