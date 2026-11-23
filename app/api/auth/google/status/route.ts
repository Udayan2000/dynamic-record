import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("google_access_token")?.value;
  const refreshToken = cookieStore.get("google_refresh_token")?.value;
  let connectedEmail = cookieStore.get("google_connected_email")?.value;

  let hasStoredCredentials = false;
  let backendEmail = "";
  let backendRefreshToken = "";

  try {
    const API_BASE = getBackendBaseUrl();
    const res = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (res.ok) {
      const profile = await res.json();
      hasStoredCredentials = Boolean(
        profile.googleDriveCredentials?.clientId && profile.googleDriveCredentials?.clientSecret
      );
      backendEmail = profile.googleDriveCredentials?.connectedEmail || "";
      backendRefreshToken = profile.googleDriveCredentials?.refreshToken || "";
    }
  } catch (err) {
    console.warn("Failed to check backend profile for google credentials:", err);
  }

  const isConnected = Boolean((accessToken || refreshToken || backendRefreshToken) && hasStoredCredentials);
  const email = connectedEmail || backendEmail || "";

  return NextResponse.json({
    isConnected,
    hasStoredCredentials,
    connectedEmail: isConnected ? email : "",
  });
}
