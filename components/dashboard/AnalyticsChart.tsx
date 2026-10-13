"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MoreHorizontal, PieChart as PieChartIcon } from "lucide-react";

export interface AnalyticsSegment {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsChartProps {
  /** Real breakdown to render. When empty the card shows a labelled empty state. */
  segments?: AnalyticsSegment[];
  /** Big number shown in the middle of the donut. */
  centerValue?: string;
  /** Caption under the centre number. */
  centerLabel?: string;
  title?: string;
  pendingMessage?: string;
}

const AnalyticsChart = ({
  segments = [],
  centerValue,
  centerLabel,
  title = "Analytics",
  pendingMessage,
}: AnalyticsChartProps) => {
  const visibleSegments = segments.filter((segment) => segment.value > 0);
  const hasData = visibleSegments.length > 0;

  return (
    <div className="flex h-full w-full flex-col bg-surface rounded-2xl p-6 shadow-surface border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <button
          type="button"
          aria-label="Chart options"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {hasData ? (
        <>
          {/* Donut Chart Container */}
          <div className="relative flex min-h-60 w-full flex-1 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visibleSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={12}
                  stroke="none"
                >
                  {visibleSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {centerValue && (
                <span className="text-2xl font-bold text-foreground">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-xs text-muted-foreground font-medium">{centerLabel}</span>
              )}
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4">
            {visibleSegments.map((segment) => (
              <div key={segment.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {segment.name} · {segment.value}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex min-h-60 w-full flex-1 flex-col items-center justify-center text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-surface-secondary text-muted-foreground">
            <PieChartIcon className="w-5 h-5" />
          </span>
          <p className="mt-3 text-sm font-medium text-foreground">Nothing to break down yet</p>
          <p className="mt-1 max-w-[14rem] text-xs leading-5 text-muted-foreground">
            {pendingMessage ?? "Add data and the breakdown will show up here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsChart;
