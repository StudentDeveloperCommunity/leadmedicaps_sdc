import type { ContestInfo } from "@/types";
import { formatISO } from "date-fns";

export async function fetchCodeforcesContests(): Promise<ContestInfo[]> {
  try {
    const response = await fetch(
      "https://codeforces.com/api/contest.list?gym=false",
      { next: { revalidate: 1800 } }
    );
    const data = await response.json();
    if (data.status !== "OK") return [];

    const now = Date.now() / 1000;

    return data.result
      .filter(
        (c: { phase: string; startTimeSeconds: number }) =>
          c.phase === "BEFORE" && c.startTimeSeconds > now
      )
      .slice(0, 10)
      .map(
        (c: {
          id: number;
          name: string;
          startTimeSeconds: number;
          durationSeconds: number;
        }): ContestInfo => ({
          id: `cf-${c.id}`,
          name: c.name,
          platform: "codeforces",
          startTime: formatISO(new Date(c.startTimeSeconds * 1000)),
          endTime: formatISO(
            new Date((c.startTimeSeconds + c.durationSeconds) * 1000)
          ),
          duration: Math.floor(c.durationSeconds / 60),
          url: `https://codeforces.com/contests/${c.id}`,
        })
      );
  } catch (error) {
    console.error("Codeforces contest fetch error:", error);
    return [];
  }
}

export async function fetchLeetCodeContests(): Promise<ContestInfo[]> {
  try {
    const query = `
      query {
        topTwoContests {
          title
          titleSlug
          startTime
          duration
          description
        }
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `;

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 1800 },
    });

    const data = await response.json();
    const now = Math.floor(Date.now() / 1000);

    const contests = [
      ...(data?.data?.topTwoContests ?? []),
      ...(data?.data?.allContests ?? []),
    ];

    // Deduplicate
    const seen = new Set<string>();
    return contests
      .filter((c: { titleSlug: string; startTime: number }) => {
        if (seen.has(c.titleSlug)) return false;
        seen.add(c.titleSlug);
        return c.startTime > now;
      })
      .slice(0, 6)
      .map(
        (c: {
          title: string;
          titleSlug: string;
          startTime: number;
          duration: number;
        }): ContestInfo => ({
          id: `lc-${c.titleSlug}`,
          name: c.title,
          platform: "leetcode",
          startTime: formatISO(new Date(c.startTime * 1000)),
          endTime: formatISO(new Date((c.startTime + c.duration) * 1000)),
          duration: Math.floor(c.duration / 60),
          url: `https://leetcode.com/contest/${c.titleSlug}`,
        })
      );
  } catch (error) {
    console.error("LeetCode contest fetch error:", error);
    return [];
  }
}

export async function fetchCodeChefContests(): Promise<ContestInfo[]> {
  try {
    // Official CodeChef API — returns future_contests sorted by start time
    const response = await fetch(
      "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&category=upcoming&limit=10",
      {
        next: { revalidate: 1800 },
        headers: { "Accept": "application/json" },
      }
    );
    const data = await response.json();
    if (data?.status !== "success") return [];

    const upcoming: ContestInfo[] = [];

    for (const c of (data.future_contests ?? []).slice(0, 6)) {
      try {
        const startTime = c.contest_start_date_iso;
        const endTime = c.contest_end_date_iso;
        const durationMins = c.contest_duration
          ? Math.floor(Number(c.contest_duration))
          : 120;

        upcoming.push({
          id: `cc-${c.contest_code}`,
          name: c.contest_name,
          platform: "codechef",
          startTime,
          endTime,
          duration: durationMins,
          url: `https://www.codechef.com/${c.contest_code}`,
        });
      } catch {
        // skip malformed entry
      }
    }

    return upcoming;
  } catch (error) {
    console.error("CodeChef contest fetch error:", error);
    return [];
  }
}

/** Fetches all contests from all platforms in parallel and sorts by start time. */
export async function fetchAllContests(): Promise<{
  contests: ContestInfo[];
  byPlatform: { codeforces: ContestInfo[]; leetcode: ContestInfo[]; codechef: ContestInfo[] };
}> {
  const [cf, lc, cc] = await Promise.all([
    fetchCodeforcesContests(),
    fetchLeetCodeContests(),
    fetchCodeChefContests(),
  ]);

  const contests = [...cf, ...lc, ...cc].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return { contests, byPlatform: { codeforces: cf, leetcode: lc, codechef: cc } };
}
