import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const isDomain = reason === "domain";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center glass border border-border/60 rounded-2xl p-10">
        <div className="h-16 w-16 rounded-full bg-destructive/20 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
        <p className="text-muted-foreground mb-6">
          {isDomain
            ? "Only @medicaps.ac.in Google accounts are allowed. Please use your university email."
            : "Something went wrong during sign in. Please try again."}
        </p>
        <Link href="/login">
          <Button className="w-full">Try Again</Button>
        </Link>
      </div>
    </div>
  );
}
