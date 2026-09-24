"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Inbox } from "lucide-react";

interface TrendChartProps {
  data: Array<{ label: string; count: number }>;
}

export function TrendChart({ data }: TrendChartProps) {
  const hasData = data.some((point) => point.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Upload Dokumen</CardTitle>
        <CardDescription>Jumlah dokumen yang diunggah per bulan</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        {!hasData ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada data"
            description="Belum ada dokumen yang diunggah pada tahun ini."
            className="h-full border-0"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--muted-foreground) / 0.3)" }}
                contentStyle={{ borderRadius: 12, fontSize: 13 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Dokumen"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface TopUsersChartProps {
  data: Array<{ name: string; count: number }>;
}

export function TopUsersChart({ data }: TopUsersChartProps) {
  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Pengguna</CardTitle>
        <CardDescription>Pengguna dengan dokumen terbanyak</CardDescription>
      </CardHeader>
      <CardContent className="h-64">
        {!hasData ? (
          <EmptyState
            icon={Inbox}
            title="Belum ada data"
            description="Belum ada dokumen yang tercatat."
            className="h-full border-0"
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: 12, fontSize: 13 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="count" name="Dokumen" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
