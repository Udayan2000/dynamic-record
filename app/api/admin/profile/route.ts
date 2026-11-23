import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");

  try {
    const backendUrl = getBackendBaseUrl();
    const response = await fetch(`${backendUrl}/admin/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken,
      },
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "Failed to fetch profile" };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}
