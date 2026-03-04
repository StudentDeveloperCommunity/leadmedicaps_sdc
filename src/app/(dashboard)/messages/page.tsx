import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import MessagesClient from "@/components/messages/messages-client";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { user: targetUserId } = await searchParams;

  // Fetch current user's profile
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("id, name, username, avatar_url")
    .eq("id", user.id)
    .single();

  // If ?user=ID param, preload that user's profile for opening conversation
  let openWithProfile = null;
  if (targetUserId && targetUserId !== user.id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, username, avatar_url")
      .eq("id", targetUserId)
      .single();
    openWithProfile = data;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-1">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Direct messages with fellow Medicaps coders
        </p>
      </div>
      <MessagesClient
        currentUserId={user.id}
        currentProfile={currentProfile}
        openWithProfile={openWithProfile}
      />
    </div>
  );
}
