import { NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mock-user";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const match = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!match) {
    return NextResponse.json(
      { success: false, message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const { password: _password, ...user } = match;
  const accessToken = `demo-token-${user.id}`;

  const res = NextResponse.json({
    success: true,
    data: { user, accessToken, refreshToken: `demo-refresh-${user.id}` },
  });

  res.cookies.set(SESSION_COOKIE, JSON.stringify({ user, accessToken }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}
