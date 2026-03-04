import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import type { UserProfile } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If profile not complete, redirect to setup
  if (profile && !profile.setup_complete) {
    // Allow access to setup page
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={profile as UserProfile} />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
