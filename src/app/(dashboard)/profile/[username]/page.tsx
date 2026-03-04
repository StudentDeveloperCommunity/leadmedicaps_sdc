import { notFound, redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import ProfileClient from "@/components/profile/profile-client";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return {
    title: `${username} — LeadMedicaps`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const supabase = await createServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch the profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) notFound();

  // Fetch current user's profile to check if viewing own profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .single();

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ProfileClient
        profile={profile}
        currentUserId={user.id}
        currentUsername={currentProfile?.username ?? ""}
        isOwnProfile={isOwnProfile}
      />
    </div>
  );
}
