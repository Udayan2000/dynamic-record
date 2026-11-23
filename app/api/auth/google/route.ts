import { NextResponse } from "next/server";
import { getOAuthClient, getRedirectUri } from "@/lib/google";
import { getSession } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urlObj = new URL(request.url);
  const returnUrl = urlObj.searchParams.get("returnUrl") || "/admin/records";

  // Fetch admin credentials
  const API_BASE = getBackendBaseUrl();
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
    return NextResponse.redirect(new URL("/admin/settings", request.url));
  }

  const redirectUri = getRedirectUri(request);
  const oauth2Client = getOAuthClient(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent", // Forces Google to show account chooser so user can pick the exact email ID
    scope: [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    state: encodeURIComponent(returnUrl),
  });

  return NextResponse.redirect(authUrl);
}
