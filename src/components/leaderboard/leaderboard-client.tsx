"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Medal,
  Search,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCPScoreLabel } from "@/lib/cp-score";

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  username: string;
  batch: number;
  branch?: string | null;
  avatar_url?: string | null;
  cp_score: number;
  total_solved: number;
  leetcode_username?: string | null;
  codeforces_username?: string | null;
  codechef_username?: string | null;
  [key: string]: unknown;
}

interface LeaderboardClientProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const BATCH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(2018 + i));

const BRANCH_OPTIONS = [
  { value: "CSE",     label: "CSE - Computer Science & Engineering" },
  { value: "CSE-AI",  label: "CSE - Artificial Intelligence" },
  { value: "CSE-DS",  label: "CSE - Data Science" },
  { value: "CSE-NET", label: "CSE - Networks" },
  { value: "CSE-AML", label: "CSE - AI & Machine Learning" },
  { value: "CSE-CS",  label: "CSE - Cyber Security" },
  { value: "CSE-IOT", label: "CSE - Internet of Things" },
  { value: "CSBS",    label: "CSBS - CS & Business Systems" },
  { value: "IT",      label: "IT - Information Technology" },
  { value: "ECE",     label: "ECE - Electronics & Communication" },
  { value: "EE",      label: "EE - Electrical Engineering" },
  { value: "CE",      label: "CE - Civil Engineering" },
  { value: "ME",      label: "ME - Mechanical Engineering" },
  { value: "AU",      label: "AU/EV - Automobile (Electric Vehicle)" },
  { value: "RA",      label: "RA - Robotics & Automation" },
];

export function LeaderboardClient({
  entries,
  currentUserId,
}: LeaderboardClientProps) {
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const filtered = entries.filter((e) => {
    const matchesSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase());
    const matchesBatch =
      batchFilter === "all" || String(e.batch) === batchFilter;
    const matchesBranch =
      branchFilter === "all" ||
      (e.branch?.toUpperCase() === branchFilter.toUpperCase());
    return matchesSearch && matchesBatch && matchesBranch;
  });

  const top3 = filtered.slice(0, 3);

  const rankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-muted-foreground";
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-400" />;
    return null;
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {entries.length} students ranked by CP Score
          </p>
        </div>
        <Badge variant="outline" className="text-sm py-1.5 px-3">
          <Trophy className="h-4 w-4 mr-1.5 text-yellow-400" />
          Live Rankings
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Branch Filter */}
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {BRANCH_OPTIONS.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Batch Filter */}
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {BATCH_OPTIONS.map((y) => (
              <SelectItem key={y} value={y}>
                Batch {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Active Filter Pills */}
      {(branchFilter !== "all" || batchFilter !== "all") && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {branchFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => setBranchFilter("all")}
            >
              Branch: {BRANCH_OPTIONS.find((b) => b.value === branchFilter)?.label ?? branchFilter} ✕
            </Badge>
          )}
          {batchFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => setBatchFilter("all")}
            >
              Batch: {batchFilter} ✕
            </Badge>
          )}
          <button
            onClick={() => { setBranchFilter("all"); setBatchFilter("all"); }}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3.map((entry, i) => {
            const { label, color } = getCPScoreLabel(entry.cp_score);
            const initials = entry.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const heights = ["order-1 sm:order-2", "order-2 sm:order-1", "order-3"];
            const cardSizes = i === 0 ? "border-yellow-400/30 bg-yellow-400/5" : "";

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={heights[i]}
              >
                <Card className={`relative overflow-hidden hover-card ${cardSizes}`} hover>
                  {i === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent pointer-events-none" />
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-1">
                      {rankIcon(entry.rank)}
                    </div>
                    <p className={`text-3xl font-black mb-3 ${rankColor(entry.rank)}`}>
                      #{entry.rank}
                    </p>
                    <Link href={`/profile/${entry.username}`}>
                      <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer">
                        <AvatarImage src={entry.avatar_url ?? ""} />
                        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <Link href={`/profile/${entry.username}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                        {entry.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-3">
                      @{entry.username} · Batch {entry.batch}
                      {entry.branch && ` · ${entry.branch}`}
                    </p>
                    <div className="text-3xl font-black gradient-text mb-1">
                      {entry.cp_score.toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">CP Score</p>
                    <Badge variant="outline" className={`${color} border-current/30 mb-4`}>
                      {label}
                    </Badge>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {entry.leetcode_username && (
                        <a href={`https://leetcode.com/${entry.leetcode_username}`} target="_blank" rel="noopener noreferrer">
                          <Badge variant="leetcode" className="gap-1 cursor-pointer hover:opacity-80">
                            LC <ExternalLink className="h-2.5 w-2.5" />
                          </Badge>
                        </a>
                      )}
                      {entry.codeforces_username && (
                        <a href={`https://codeforces.com/profile/${entry.codeforces_username}`} target="_blank" rel="noopener noreferrer">
                          <Badge variant="codeforces" className="gap-1 cursor-pointer hover:opacity-80">
                            CF <ExternalLink className="h-2.5 w-2.5" />
                          </Badge>
                        </a>
                      )}
                      {entry.codechef_username && (
                        <a href={`https://www.codechef.com/users/${entry.codechef_username}`} target="_blank" rel="noopener noreferrer">
                          <Badge variant="codechef" className="gap-1 cursor-pointer hover:opacity-80">
                            CC <ExternalLink className="h-2.5 w-2.5" />
                          </Badge>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Full Rankings
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filtered.length} student{filtered.length !== 1 ? "s" : ""})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-xs text-muted-foreground font-medium bg-muted/30">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5 sm:col-span-3">Student</div>
              <div className="col-span-2 text-center hidden sm:block">Branch</div>
              <div className="col-span-2 text-center hidden sm:block">Batch</div>
              <div className="col-span-3 sm:col-span-2 text-center">CP Score</div>
              <div className="col-span-2 text-center hidden md:block">Solved</div>
              <div className="col-span-2 sm:col-span-1 text-center">Links</div>
            </div>

            {filtered.length === 0 ? (
              <div className="px-4 py-12 text-center text-muted-foreground">
                No students found for selected filters
              </div>
            ) : (
              filtered.map((entry, i) => {
                const { label, color } = getCPScoreLabel(entry.cp_score);
                const initials = entry.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const isCurrentUser = entry.id === currentUserId;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 transition-colors ${
                      isCurrentUser ? "bg-primary/5 hover:bg-primary/8" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 text-center">
                      <span className={`font-bold text-sm ${rankColor(entry.rank)}`}>
                        {entry.rank <= 3 ? rankIcon(entry.rank) : entry.rank}
                      </span>
                    </div>

                    {/* Student */}
                    <div className="col-span-5 sm:col-span-3">
                      <Link href={`/profile/${entry.username}`} className="flex items-center gap-2 group">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={entry.avatar_url ?? ""} />
                          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-1 text-xs text-primary">(you)</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{entry.username}
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Branch */}
                    <div className="col-span-2 text-center hidden sm:block">
                      {entry.branch ? (
                        <Badge variant="outline" className="text-xs">
                          {entry.branch}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Batch */}
                    <div className="col-span-2 text-center hidden sm:block">
                      <Badge variant="outline" className="text-xs">
                        {entry.batch}
                      </Badge>
                    </div>

                    {/* CP Score */}
                    <div className="col-span-3 sm:col-span-2 text-center">
                      <p className="font-bold text-sm gradient-text">
                        {entry.cp_score.toFixed(1)}
                      </p>
                    </div>

                    {/* Solved */}
                    <div className="col-span-2 text-center hidden md:block">
                      <p className="text-sm">{entry.total_solved}</p>
                    </div>

                    {/* Links */}
                    <div className="col-span-2 sm:col-span-1 flex gap-1 justify-center">
                      {entry.leetcode_username && (
                        <a href={`https://leetcode.com/${entry.leetcode_username}`} target="_blank" rel="noopener noreferrer" title="LeetCode">
                          <div className="h-5 w-5 rounded-sm bg-[#ffa116] flex items-center justify-center text-black text-xs font-bold hover:opacity-80 transition-opacity">
                            L
                          </div>
                        </a>
                      )}
                      {entry.codeforces_username && (
                        <a href={`https://codeforces.com/profile/${entry.codeforces_username}`} target="_blank" rel="noopener noreferrer" title="Codeforces">
                          <div className="h-5 w-5 rounded-sm bg-[#1f8dd6] flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity">
                            C
                          </div>
                        </a>
                      )}
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
