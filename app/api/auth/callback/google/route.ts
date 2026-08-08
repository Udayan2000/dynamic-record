import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOAuthClient } from "@/lib/google";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    
    if (!res.ok) throw new Error("Failed to fetch profile");

    const profile = await res.json();
    const clientId = profile.googleDriveCredentials?.clientId;
    const clientSecret = profile.googleDriveCredentials?.clientSecret;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/admin/settings", request.url));
    }

    const oauth2Client = getOAuthClient(clientId, clientSecret);
    const { tokens } = await oauth2Client.getToken(code);
    const cookieStore = await cookies();
    
    if (tokens.access_token) {
      cookieStore.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 3600, // 1 hour
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return NextResponse.redirect(new URL("/admin/records", request.url));
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
