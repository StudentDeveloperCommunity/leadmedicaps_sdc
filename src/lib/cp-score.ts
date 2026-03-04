import type {
  LeetCodeStats,
  CodeforcesStats,
  CodeChefStats,
  CPScoreBreakdown,
} from "@/types";

/**
 * CP Score Formula — LeadMedicaps
 *
 * Each platform is normalized to a 0–100 scale, then weighted:
 *
 *   LeetCode  : weight 30%
 *   Codeforces: weight 40%
 *   CodeChef  : weight 30%
 *
 * LeetCode score (contest rating only):
 *   lc_norm = min(100, max(0, (contestRating - 1200) / 10))  [1200→0, 2200→100]
 *   if never participated in contests: lc_norm = 0
 *
 * Codeforces:
 *   cf_norm = min(100, max(0, rating / 20))   [0→0, 2000→100]
 *
 * CodeChef:
 *   cc_norm = min(100, max(0, (rating - 1000) / 15))  [1000→0, 2500→100]
 *
 * All three platforms use independent rating scales normalised to the same
 * 0–100 range before being combined, so they are directly comparable.
 *
 * Aggregate CP Score (0–100):
 *   CP = 0.30 * lc_norm + 0.40 * cf_norm + 0.30 * cc_norm
 *   (weights redistributed dynamically if a platform is missing)
 *
 * Tiebreaker: total questions solved across ALL platforms combined.
 */

export function calcLeetCodeNorm(stats: Partial<LeetCodeStats>): number {
  const contestRating = stats.contestRating ?? 0;
  return Math.min(100, Math.max(0, (contestRating - 1200) / 10));
}

export function calcCodeforcesNorm(stats: Partial<CodeforcesStats>): number {
  const rating = stats.rating ?? 0;
  return Math.min(100, Math.max(0, rating / 20));
}

export function calcCodeChefNorm(stats: Partial<CodeChefStats>): number {
  const rating = stats.rating ?? 0;
  return Math.min(100, Math.max(0, (rating - 1000) / 15));
}

export function calcCPScore(
  leetcode: Partial<LeetCodeStats> | null,
  codeforces: Partial<CodeforcesStats> | null,
  codechef: Partial<CodeChefStats> | null
): CPScoreBreakdown {
  const leetcodeNorm = leetcode ? calcLeetCodeNorm(leetcode) : 0;
  const codeforcesNorm = codeforces ? calcCodeforcesNorm(codeforces) : 0;
  const codechefNorm = codechef ? calcCodeChefNorm(codechef) : 0;

  const hasLC = leetcode !== null;
  const hasCF = codeforces !== null;
  const hasCC = codechef !== null;

  // Dynamic weighting: redistribute weights if a platform is missing
  const weights = { lc: 0.3, cf: 0.4, cc: 0.3 };
  let totalWeight = 0;
  if (hasLC) totalWeight += weights.lc;
  if (hasCF) totalWeight += weights.cf;
  if (hasCC) totalWeight += weights.cc;

  const totalScore =
    totalWeight > 0
      ? ((hasLC ? weights.lc * leetcodeNorm : 0) +
          (hasCF ? weights.cf * codeforcesNorm : 0) +
          (hasCC ? weights.cc * codechefNorm : 0)) /
        totalWeight
      : 0;

  const roundedTotal = Math.round(totalScore * 100) / 100;
  return {
    leetcodeScore: hasLC ? Math.round((leetcodeNorm * weights.lc / totalWeight) * 100) / 100 : 0,
    codeforcesScore: hasCF ? Math.round((codeforcesNorm * weights.cf / totalWeight) * 100) / 100 : 0,
    codechefScore: hasCC ? Math.round((codechefNorm * weights.cc / totalWeight) * 100) / 100 : 0,
    totalScore: roundedTotal,
    leetcodeNorm: Math.round(leetcodeNorm * 100) / 100,
    codeforcesNorm: Math.round(codeforcesNorm * 100) / 100,
    codechefNorm: Math.round(codechefNorm * 100) / 100,
  };
}

export function getTotalSolved(
  leetcode: Partial<LeetCodeStats> | null,
  codeforces: Partial<CodeforcesStats> | null,
  codechef: Partial<CodeChefStats> | null
): number {
  return (
    (leetcode?.totalSolved ?? 0) +
    (codeforces?.totalSolved ?? 0) +
    (codechef?.totalSolved ?? 0)
  );
}

export function getCPScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: "Legendary", color: "text-red-400" };
  if (score >= 65) return { label: "Grandmaster", color: "text-orange-400" };
  if (score >= 50) return { label: "Master", color: "text-violet-400" };
  if (score >= 35) return { label: "Expert", color: "text-blue-400" };
  if (score >= 20) return { label: "Specialist", color: "text-cyan-400" };
  if (score >= 10) return { label: "Pupil", color: "text-green-400" };
  return { label: "Newbie", color: "text-gray-400" };
}
