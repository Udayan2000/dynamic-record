import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasPermission, getDefaultRouteForRole } from "@/lib/permissions";
import type { Permission, Role } from "@/types";

/**
 * Use inside a server component / layout to hard-block a route unless
 * the current session matches the given role. Redirects to that role's
 * own dashboard (not to login) if they're logged in but wrong role.
 */
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user.role !== role) redirect(getDefaultRouteForRole(session.user.role));
  return session;
}

/**
 * Use for finer-grained checks inside a role (e.g. gating one settings
 * tab for admins who lack a specific permission).
 */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!hasPermission(session.user.role, permission)) {
    redirect(getDefaultRouteForRole(session.user.role));
  }
  return session;
}
