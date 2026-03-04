import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

// GET /api/messages?with=USER_ID  — load conversation with a user
// GET /api/messages               — load all conversations
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withUserId = req.nextUrl.searchParams.get("with");

  if (withUserId) {
    // Load conversation messages between two users
    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        content,
        created_at,
        read,
        sender_id,
        receiver_id,
        sender:profiles!messages_sender_id_fkey(id, name, username, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, name, username, avatar_url)
      `
      )
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mark messages from the other user as read
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", withUserId)
      .eq("receiver_id", user.id)
      .eq("read", false);

    return NextResponse.json({ messages: messages ?? [] });
  }

  // Load all conversations (latest message per conversation partner)
  const { data: sentMessages } = await supabase
    .from("messages")
    .select(
      `
      id, content, created_at, read, sender_id, receiver_id,
      other:profiles!messages_receiver_id_fkey(id, name, username, avatar_url)
    `
    )
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false });

  const { data: receivedMessages } = await supabase
    .from("messages")
    .select(
      `
      id, content, created_at, read, sender_id, receiver_id,
      other:profiles!messages_sender_id_fkey(id, name, username, avatar_url)
    `
    )
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false });

  // Deduplicate by conversation partner, keeping latest msg per partner
  const convMap = new Map<
    string,
    { partnerId: string; partner: unknown; lastMessage: string; lastAt: string; unread: number }
  >();

  const allMessages = [
    ...(sentMessages ?? []).map((m) => ({
      ...m,
      partnerId: m.receiver_id,
      isSent: true,
    })),
    ...(receivedMessages ?? []).map((m) => ({
      ...m,
      partnerId: m.sender_id,
      isSent: false,
    })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const msg of allMessages) {
    if (!convMap.has(msg.partnerId)) {
      convMap.set(msg.partnerId, {
        partnerId: msg.partnerId,
        partner: msg.other,
        lastMessage: msg.content,
        lastAt: msg.created_at,
        unread: 0,
      });
    }
  }

  // Count unread
  for (const msg of receivedMessages ?? []) {
    if (!msg.read) {
      const existing = convMap.get(msg.sender_id);
      if (existing) existing.unread += 1;
    }
  }

  const conversations = Array.from(convMap.values());
  return NextResponse.json({ conversations });
}

// POST /api/messages  body: { receiver_id, content }
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { receiver_id, content } = body;

  if (!receiver_id || !content?.trim()) {
    return NextResponse.json(
      { error: "receiver_id and content are required" },
      { status: 400 }
    );
  }

  // Prevent messaging yourself
  if (receiver_id === user.id) {
    return NextResponse.json(
      { error: "Cannot message yourself" },
      { status: 400 }
    );
  }

  const { data: message, error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, receiver_id, content: content.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
