import { createClient } from "@/lib/supabase/server";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

// Revalidate leaderboard every 60 seconds in production
export const revalidate = 60;

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select(
      "id, name, username, batch, avatar_url, cp_score, total_solved, leetcode_username, codeforces_username, codechef_username"
    )
    .eq("setup_complete", true)
    .order("cp_score", { ascending: false })
    .order("total_solved", { ascending: false });

  const leaderboard = (profiles ?? []).map((p, i) => ({
    ...p,
    rank: i + 1,
  }));

  const { data: { user } } = await supabase.auth.getUser();

  return <LeaderboardClient entries={leaderboard} currentUserId={user?.id} />;
}
