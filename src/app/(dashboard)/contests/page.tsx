import { Suspense } from "react";
import ContestsClient from "@/components/contests/contests-client";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllContests } from "@/lib/contests";

// Cache the page at the CDN level for 30 minutes in production
export const revalidate = 1800;

export default async function ContestsPage() {
  const { contests } = await fetchAllContests().catch(() => ({ contests: [] as import("@/types").ContestInfo[] }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          Upcoming Contests
        </h1>
        <p className="text-muted-foreground">
          Stay ahead — track contests on LeetCode, Codeforces, and CodeChef.
        </p>
      </div>

      <Suspense fallback={<ContestsSkeleton />}>
        <ContestsClient initialContests={contests} />
      </Suspense>
    </div>
  );
}

function ContestsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}
