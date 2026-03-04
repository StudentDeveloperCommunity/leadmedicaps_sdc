"use client";

import { useState } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getCFRankColor, getStarColor } from "@/lib/utils";
import type { LeetCodeStats, CodeforcesStats, CodeChefStats } from "@/types";

interface PlatformCardProps {
  platform: "leetcode" | "codeforces" | "codechef";
  username?: string | null;
  stats: LeetCodeStats | CodeforcesStats | CodeChefStats | null;
  /** If provided, a pencil icon appears so the user can edit this platform's username inline. */
  onUsernameUpdate?: (username: string, stats: LeetCodeStats | CodeforcesStats | CodeChefStats) => void;
}

export function PlatformCard({ platform, username, stats, onUsernameUpdate }: PlatformCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState(username ?? "");
  const [saving, setSaving] = useState(false);
  const platformConfig = {
    leetcode: {
      name: "LeetCode",
      color: "#ffa116",
      bg: "bg-[#ffa116]/10",
      border: "border-[#ffa116]/20",
      profileUrl: (u: string) => `https://leetcode.com/${u}`,
    },
    codeforces: {
      name: "Codeforces",
      color: "#1f8dd6",
      bg: "bg-[#1f8dd6]/10",
      border: "border-[#1f8dd6]/20",
      profileUrl: (u: string) => `https://codeforces.com/profile/${u}`,
    },
    codechef: {
      name: "CodeChef",
      color: "#b45309",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      profileUrl: (u: string) => `https://www.codechef.com/users/${u}`,
    },
  };

  const config = platformConfig[platform];

  async function handleSave() {
    const trimmed = inputValue.trim();
    if (!trimmed || trimmed === username) {
      setDialogOpen(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/cp/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, username: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      toast.success(`${config.name} username updated!`);
      setDialogOpen(false);
      onUsernameUpdate?.(data.username, data.stats);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  if (!username) {
    return (
      <>
        <Card className={`border ${config.border}`}>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-muted-foreground">
              No {config.name} username linked
            </p>
            {onUsernameUpdate ? (
              <Button variant="outline" size="sm" onClick={() => { setInputValue(""); setDialogOpen(true); }}>
                Add username
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <a href="/setup">Add username</a>
              </Button>
            )}
          </CardContent>
        </Card>
        <EditDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          platform={config.name}
          value={inputValue}
          onChange={setInputValue}
          onSave={handleSave}
          saving={saving}
        />
      </>
    );
  }

  if (!stats) {
    return (
      <Card className={`border ${config.border}`}>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <p className="text-muted-foreground">
            No data yet. Click &quot;Refresh Stats&quot; to fetch.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${config.border} ${config.bg}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: config.color }}
          />
          {config.name}
        </CardTitle>
        <div className="flex items-center gap-1">
          <a
            href={config.profileUrl(username)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              @{username}
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
          {onUsernameUpdate && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title={`Edit ${config.name} username`}
              onClick={() => { setInputValue(username); setDialogOpen(true); }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <EditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        platform={config.name}
        value={inputValue}
        onChange={setInputValue}
        onSave={handleSave}
        saving={saving}
      />

      <CardContent>
        {platform === "leetcode" && (
          <LeetCodeDetails stats={stats as LeetCodeStats} />
        )}
        {platform === "codeforces" && (
          <CodeForcesDetails stats={stats as CodeforcesStats} />
        )}
        {platform === "codechef" && (
          <CodeChefDetails stats={stats as CodeChefStats} />
        )}
      </CardContent>
    </Card>
  );
}

function LeetCodeDetails({ stats }: { stats: LeetCodeStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Total Solved" value={stats.totalSolved} />
      <Stat label="Easy" value={stats.easySolved} color="text-green-400" />
      <Stat label="Medium" value={stats.mediumSolved} color="text-yellow-400" />
      <Stat label="Hard" value={stats.hardSolved} color="text-red-400" />
      <Stat label="Ranking" value={`#${stats.ranking?.toLocaleString()}`} />
      <Stat
        label="Contest Rating"
        value={stats.contestRating ? Math.round(stats.contestRating) : "N/A"}
      />
      <Stat label="Contests" value={stats.contestAttended ?? "N/A"} />
      <Stat label="Acceptance" value={`${stats.acceptanceRate}%`} />
    </div>
  );
}

function CodeForcesDetails({ stats }: { stats: CodeforcesStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Rating" value={stats.rating || "Unrated"} />
      <Stat label="Max Rating" value={stats.maxRating || "—"} />
      <Stat
        label="Rank"
        value={stats.rank}
        color={getCFRankColor(stats.rank)}
        className="capitalize"
      />
      <Stat
        label="Max Rank"
        value={stats.maxRank}
        color={getCFRankColor(stats.maxRank)}
        className="capitalize"
      />
      <Stat label="Problems Solved" value={stats.totalSolved} />
      <Stat label="Contribution" value={stats.contribution} />
    </div>
  );
}

function CodeChefDetails({ stats }: { stats: CodeChefStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Stat label="Rating" value={stats.rating} />
      <Stat
        label="Stars"
        value={stats.stars}
        color={getStarColor(String(stats.stars))}
      />
      <Stat label="Highest Rating" value={stats.highestRating} />
      <Stat
        label="Global Rank"
        value={stats.globalRank ? `#${stats.globalRank.toLocaleString()}` : "—"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  className,
}: {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${color ?? ""} ${className ?? ""}`}>
        {value}
      </p>
    </div>
  );
}

function EditDialog({
  open,
  onOpenChange,
  platform,
  value,
  onChange,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  platform: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit {platform} Username</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-2">
          <Label htmlFor="platform-username">Username</Label>
          <Input
            id="platform-username"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Your ${platform} username`}
            onKeyDown={(e) => e.key === "Enter" && !saving && onSave()}
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Stats will be re-fetched automatically after saving.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="ghost" disabled={saving}>Cancel</Button>
          </DialogClose>
          <Button onClick={onSave} disabled={saving || !value.trim()}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
