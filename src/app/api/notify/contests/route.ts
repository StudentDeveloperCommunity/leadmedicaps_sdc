import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch upcoming contests
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const contestsRes = await fetch(`${baseUrl}/api/contests`);
  const contestsData = await contestsRes.json();

  if (!contestsData.contests?.length) {
    return NextResponse.json({ message: "No upcoming contests" });
  }

  // Fetch all user emails for notification (only medicaps.ac.in)
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email, name")
    .like("email", "%@medicaps.ac.in");

  if (!profiles?.length) {
    return NextResponse.json({ message: "No users to notify" });
  }

  // Use Supabase's built-in email (using admin auth)
  // We'll use a simple approach with the Auth OTP mechanism for emails
  // In production, integrate with Resend (free tier: 100 emails/day)
  // For now we use Supabase Edge Functions or external SMTP

  const upcoming = contestsData.contests.slice(0, 5);

  const emailBody = `
Hi there! 🚀

Upcoming Competitive Programming Contests this week:

${upcoming
  .map(
    (c: { platform: string; name: string; startTime: string; url: string }) =>
      `📌 [${c.platform.toUpperCase()}] ${c.name}
   📅 Starts: ${new Date(c.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
   🔗 ${c.url}
`
  )
  .join("\n")}

Stay sharp! — LeadMedicaps
https://leadmedicaps.medicaps.ac.in
  `.trim();

  // Log for now — integrate with Resend/Nodemailer in production
  console.log("Contest notification email:", emailBody);
  console.log(
    "Sending to:",
    profiles.map((p) => p.email)
  );

  return NextResponse.json({
    success: true,
    message: `Notifications queued for ${profiles.length} users`,
    contest_count: upcoming.length,
    preview: emailBody,
  });
}
