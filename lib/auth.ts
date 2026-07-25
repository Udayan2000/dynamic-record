import { cookies } from "next/headers";
import type { User } from "@/types";

export const SESSION_COOKIE = "session";

export interface Session {
  user: User;
  accessToken: string;
}

/**
 * Reads the session from the httpOnly cookie set by the login API route.
 * Replace the JSON.parse below with real JWT verification (e.g. `jose`)
 * once the backend issues signed tokens.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  return (await getSession()) !== null;
}
