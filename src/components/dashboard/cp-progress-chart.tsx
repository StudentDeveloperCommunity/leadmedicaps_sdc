"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  LeetCodeStats,
  CodeforcesStats,
  CodeChefStats,
  CPScoreBreakdown,
} from "@/types";

interface CPProgressChartProps {
  lcStats: LeetCodeStats | null;
  cfStats: CodeforcesStats | null;
  ccStats: CodeChefStats | null;
  cpScore: CPScoreBreakdown;
}

export function CPProgressChart({
  lcStats,
  cfStats,
  ccStats,
  cpScore,
}: CPProgressChartProps) {
  // Radar chart data
  const radarData = [
    {
      subject: "LeetCode",
      score: cpScore.leetcodeNorm,
      fullMark: 100,
    },
    {
      subject: "Codeforces",
      score: cpScore.codeforcesNorm,
      fullMark: 100,
    },
    {
      subject: "CodeChef",
      score: cpScore.codechefNorm,
      fullMark: 100,
    },
  ];

  // Difficulty breakdown for LeetCode
  const difficultyData = lcStats
    ? [
        { name: "Easy", count: lcStats.easySolved, fill: "#22c55e" },
        { name: "Medium", count: lcStats.mediumSolved, fill: "#eab308" },
        { name: "Hard", count: lcStats.hardSolved, fill: "#ef4444" },
      ]
    : [];

  // Platform comparison bar chart
  const platformData = [
    {
      name: "LC",
      solved: lcStats?.totalSolved ?? 0,
      fill: "#ffa116",
    },
    {
      name: "CF",
      solved: cfStats?.totalSolved ?? 0,
      fill: "#1f8dd6",
    },
    {
      name: "CC",
      solved: ccStats?.totalSolved ?? 0,
      fill: "#b45309",
    },
  ];

  const hasData = lcStats || cfStats || ccStats;

  if (!hasData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No stats available. Refresh or add your platform usernames.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Radar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* LeetCode Difficulty */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            LeetCode Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lcStats ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={difficultyData} barSize={40}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
              No LeetCode data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problems Solved Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground font-normal">
            Problems Solved by Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={platformData} barSize={50}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar dataKey="solved" radius={[6, 6, 0, 0]}>
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
