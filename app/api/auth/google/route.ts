import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/google";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch admin credentials
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
  const res = await fetch(`${API_BASE}/admin/profile`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }

  const profile = await res.json();
  const clientId = profile.googleDriveCredentials?.clientId;
  const clientSecret = profile.googleDriveCredentials?.clientSecret;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/admin/settings", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  }

  const oauth2Client = getOAuthClient(clientId, clientSecret);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });

  return NextResponse.redirect(url);
}
