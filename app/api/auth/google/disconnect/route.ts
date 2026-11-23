import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.delete("google_access_token");
  cookieStore.delete("google_refresh_token");
  cookieStore.delete("google_connected_email");

  // Also clear in backend profile
  try {
    const API_BASE = getBackendBaseUrl();
    const profileRes = await fetch(`${API_BASE}/admin/profile`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (profileRes.ok) {
      const profile = await profileRes.json();
      await fetch(`${API_BASE}/admin/profile/google-drive`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          clientId: profile.googleDriveCredentials?.clientId || "",
          clientSecret: profile.googleDriveCredentials?.clientSecret || "",
          connectedEmail: "",
          refreshToken: "",
        }),
      });
    }
  } catch (e) {
    console.warn("Failed to clear backend google credentials:", e);
  }

  return NextResponse.json({ success: true, message: "Google Drive disconnected successfully" });
}
