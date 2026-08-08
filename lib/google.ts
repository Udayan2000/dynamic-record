import { google } from "googleapis";

export const getOAuthClient = (clientId: string, clientSecret: string) => {
  const REDIRECT_URI = process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google` 
    : "http://localhost:3000/api/auth/callback/google";

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );
};
