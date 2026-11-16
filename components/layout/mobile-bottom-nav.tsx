"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileStack,
  FolderOpenDot,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_BOTTOM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Records", href: "/admin/records", icon: FolderOpenDot },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const EMPLOYEE_BOTTOM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function MobileBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "admin" ? ADMIN_BOTTOM_NAV : EMPLOYEE_BOTTOM_NAV;

  return (
    <nav
      role="navigation"
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-lg select-none transition-transform"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)",
      }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" &&
              item.href !== "/employee/dashboard" &&
              pathname?.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 transition-all relative select-none",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={cn("h-5 w-5 transition-transform duration-150", active && "scale-110")} />
                {active && (
                  <span className="absolute -bottom-1.5 h-1 w-4 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight mt-1.5 truncate max-w-[62px]",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
