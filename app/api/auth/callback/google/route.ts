import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOAuthClient, getRedirectUri } from "@/lib/google";
import { getSession } from "@/lib/auth";
import { google } from "googleapis";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawState = url.searchParams.get("state");
  const returnUrl = rawState ? decodeURIComponent(rawState) : "/admin/records";

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const API_BASE = getBackendBaseUrl();
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

    const redirectUri = getRedirectUri(request);
    const oauth2Client = getOAuthClient(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch the connected Google account's email address
    let connectedEmail = "";
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      connectedEmail = userInfo.data.email || "";
    } catch (e) {
      console.warn("Could not fetch Google user info:", e);
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    
    if (tokens.access_token) {
      cookieStore.set("google_access_token", tokens.access_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 3600, // 1 hour
      });
    }

    if (tokens.refresh_token) {
      cookieStore.set("google_refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    if (connectedEmail) {
      cookieStore.set("google_connected_email", connectedEmail, {
        httpOnly: false, // Accessible to client so UI can show the active email
        secure: isProd,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });

      // Also persist to backend profile
      try {
        await fetch(`${API_BASE}/admin/profile/google-drive`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            clientId,
            clientSecret,
            connectedEmail,
            refreshToken: tokens.refresh_token || profile.googleDriveCredentials?.refreshToken || "",
          }),
        });
      } catch (err) {
        console.warn("Failed to persist connectedEmail in backend profile:", err);
      }
    }

    // Redirect directly back to the returnUrl
    const targetUrl = new URL(returnUrl, request.url);
    return NextResponse.redirect(targetUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed", details: String(error) }, { status: 500 });
  }
}
