import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  try {
    const body = await req.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/profile/google-drive`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}
