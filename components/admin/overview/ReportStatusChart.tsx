"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportStatusChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-5)"];

export const ReportStatusChart = ({ data }: ReportStatusChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Status</CardTitle>
        <p className="text-sm text-muted-foreground">Overview of customer reports</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--card-foreground)",
              }}
            />
            <Legend
              formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};