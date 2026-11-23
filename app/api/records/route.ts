import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");
  const contentType = req.headers.get("content-type") || "";

  try {
    let bodyPayload: string;
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": authToken,
    };

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const templateId = formData.get("templateId") as string;
      const rawData = formData.get("data");
      let dataObj: Record<string, any> = {};
      if (typeof rawData === "string") {
        try {
          dataObj = JSON.parse(rawData);
        } catch {
          dataObj = {};
        }
      }
      const imageFile = formData.get("image");
      if (imageFile && imageFile instanceof Blob) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const base64 = buffer.toString("base64");
        const mime = imageFile.type || "image/jpeg";
        dataObj["Attached Photo"] = `data:${mime};base64,${base64}`;
      }
      bodyPayload = JSON.stringify({ templateId, data: dataObj });
    } else {
      bodyPayload = JSON.stringify(await req.json());
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/records`, {
      method: "POST",
      headers,
      body: bodyPayload,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const incomingAuth = req.headers.get("authorization");
  const authToken = incomingAuth || (token ? `Bearer ${token}` : "");
  
  // Forward query params
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const url = queryString 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/records?${queryString}`
    : `${process.env.NEXT_PUBLIC_BASE_URL}/records`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authToken,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "An error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
}
