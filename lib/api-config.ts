export function getBackendBaseUrl(): string {
  const rawBase = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001/api";
  const cleanBase = rawBase.replace(/\/+$/, "");
  return cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;
}
