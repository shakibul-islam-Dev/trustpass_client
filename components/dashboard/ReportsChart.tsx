"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { LineChart, MoreHorizontal } from "lucide-react";

export interface ReportPoint {
  time: string;
  sales: number;
}

interface ReportsChartProps {
  /** Real data points. When empty the card shows a labelled empty state. */
  data?: ReportPoint[];
  title?: string;
  /** Label used in the tooltip (e.g. "Revenue"). */
  valueLabel?: string;
  /** Explains why there is no chart yet. */
  pendingMessage?: string;
}

interface TooltipEntry {
  value?: number | string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  valueLabel?: string;
}

const CustomTooltip = ({ active, payload, valueLabel }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-foreground text-background px-4 py-2 rounded-xl shadow-overlay text-center relative -top-6">
        <p className="text-xs text-background/70 font-medium">{valueLabel}</p>
        <p className="text-base font-bold">{Number(payload[0]?.value ?? 0).toLocaleString()}</p>
        <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45"></div>
      </div>
    );
  }
  return null;
};

const ReportsChart = ({
  data,
  title = "Reports",
  valueLabel = "Sales",
  pendingMessage,
}: ReportsChartProps) => {
  const hasData = Boolean(data && data.length);

  return (
    <div className="flex h-full w-full flex-col bg-surface rounded-2xl p-6 shadow-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          aria-label="Chart options"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="min-h-64 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="time"
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, "auto"]}
              />
              <Tooltip content={<CustomTooltip valueLabel={valueLabel} />} />

              <Area
                type="monotone"
                dataKey="sales"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGradient)"
                activeDot={{ r: 6, fill: "var(--color-surface)", stroke: "var(--color-primary)", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-64 w-full flex-1 flex-col items-center justify-center text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
            <LineChart className="w-5 h-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">No trend data yet</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
            {pendingMessage ??
              "Your trend will appear here once the matching backend data is available."}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsChart;
