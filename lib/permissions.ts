import type { Permission, Role } from "@/types";

/**
 * Single source of truth for what each role can do.
 * Admin gets the full permission set; Employee gets a limited subset.
 * Add/remove strings here to change access across the whole app.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "view_dashboard",
    "manage_employees",
    "manage_templates",
    "view_all_records",
    "view_reports",
    "manage_settings",
    "upload_documents",
    "view_own_records",
    "manage_profile",
  ],
  employee: [
    "view_dashboard",
    "upload_documents",
    "view_own_records",
    "manage_profile",
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getDefaultRouteForRole(role: Role): string {
  return role === "admin" ? "/admin/dashboard" : "/employee/dashboard";
}
