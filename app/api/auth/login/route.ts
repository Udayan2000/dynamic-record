import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  
  const {email, password} = await req.json();

  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      const cookieStore = await cookies();
      cookieStore.set("access_token", data.token);
      cookieStore.set("role", data.role);
      cookieStore.set("user", JSON.stringify(data.user));
      // Also set the "session" cookie for lib/auth.ts (requireRole)
      cookieStore.set("session", JSON.stringify({ user: { ...data.user, role: data.role }, accessToken: data.token }));
    }

    return NextResponse.json(data, {
      status: response.status,
    });

  }catch(err){
    return NextResponse.json({
      message:err
    })
  }
}
