import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const rawBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
    const cleanBase = rawBase.replace(/\/+$/, "");
    const apiBase = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

    const response = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const cookieStore = await cookies();
      const isProd = process.env.NODE_ENV === "production";
      const baseCookieOptions = {
        path: "/",
        sameSite: "lax" as const,
        secure: isProd,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      };

      cookieStore.set("access_token", data.token, {
        ...baseCookieOptions,
        httpOnly: true,
      });
      cookieStore.set("role", data.role, {
        ...baseCookieOptions,
        httpOnly: false,
      });
      cookieStore.set("user", JSON.stringify(data.user), {
        ...baseCookieOptions,
        httpOnly: false,
      });
      // Set the "session" cookie for lib/auth.ts (requireRole / AdminLayout)
      cookieStore.set(
        "session",
        JSON.stringify({ user: { ...data.user, role: data.role }, accessToken: data.token }),
        {
          ...baseCookieOptions,
          httpOnly: true,
        }
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        message: err?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
