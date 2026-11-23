import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  
  cookieStore.set("access_token", "", { path: "/", maxAge: 0 });
  cookieStore.set("role", "", { path: "/", maxAge: 0 });
  cookieStore.set("user", "", { path: "/", maxAge: 0 });
  cookieStore.set("session", "", { path: "/", maxAge: 0 });

  return NextResponse.json({ message: "Logged out successfully" }, { status: 200 });
}
