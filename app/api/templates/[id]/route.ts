import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { getBackendBaseUrl } from "@/lib/api-config";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");
  const { id } = await params;

  try {
    const backendUrl = getBackendBaseUrl();
    const response = await fetch(`${backendUrl}/templates/${id}`, {
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
      data = { message: text || "Failed to fetch template" };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");
  const { id } = await params;

  try {
    const backendUrl = getBackendBaseUrl();
    const response = await fetch(`${backendUrl}/templates/${id}`, {
      method: "DELETE",
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
      data = { message: text || "Failed to delete template" };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");
  const { id } = await params;
  const body = await req.json();

  try {
    const backendUrl = getBackendBaseUrl();
    const response = await fetch(`${backendUrl}/templates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text || "Failed to update template" };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}
