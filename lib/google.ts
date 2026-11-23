import { google } from "googleapis";

export const getRedirectUri = (reqOrOrigin?: string | Request) => {
  if (typeof reqOrOrigin === "string" && reqOrOrigin.startsWith("http")) {
    const clean = reqOrOrigin.replace(/\/$/, "");
    if (clean.endsWith("/api/auth/callback/google")) return clean;
    return `${clean}/api/auth/callback/google`;
  }
  
  if (reqOrOrigin && typeof reqOrOrigin === "object" && "url" in reqOrOrigin) {
    try {
      const url = new URL(reqOrOrigin.url);
      return `${url.origin}/api/auth/callback/google`;
    } catch {
      // fallback
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (appUrl) {
    return `${appUrl}/api/auth/callback/google`;
  }

  return "http://localhost:3000/api/auth/callback/google";
};

export const getOAuthClient = (clientId: string, clientSecret: string, redirectUri?: string) => {
  const effectiveRedirectUri = redirectUri || getRedirectUri();

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    effectiveRedirectUri
  );
};
