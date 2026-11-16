"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileStack,
  FolderOpenDot,
  Settings,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Records", href: "/admin/records", icon: FolderOpenDot },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const EMPLOYEE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Profile", href: "/employee/profile", icon: UserCircle },
];

function SidebarTooltip({
  children,
  text,
  side = "right",
  show = true,
}: {
  children: React.ReactNode;
  text: string;
  side?: "right" | "bottom";
  show?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {children}
      {show && isHovered && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-50 whitespace-nowrap rounded-[4px] px-2.5 py-1 text-xs font-medium shadow-lg transition-all duration-150",
            "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700/50 dark:border-zinc-300/50",
            side === "right" &&
              "left-full ml-3 top-1/2 -translate-y-1/2",
            side === "bottom" &&
              "top-full mt-2.5 right-0"
          )}
        >
          {text}
          {side === "right" && (
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100" />
          )}
          {side === "bottom" && (
            <span className="absolute bottom-full right-3 border-4 border-transparent border-b-zinc-900 dark:border-b-zinc-100" />
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dynamic_record_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("dynamic_record_sidebar_collapsed", String(next));
      return next;
    });
  };

  const items = role === "admin" ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border border-border bg-card text-card-foreground m-2 mt-0 mr-0 rounded-lg sticky top-2 h-[calc(100vh-16px)] shadow-xs transition-[width] duration-300 ease-in-out shrink-0 z-40 relative overflow-visible",
        isCollapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      {isCollapsed ? (
        <div className="flex h-16 items-center justify-center border-b border-border">
          <SidebarTooltip text="Expand sidebar" side="right">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-xs"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </SidebarTooltip>
        </div>
      ) : (
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Logo href={role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} />
          <SidebarTooltip text="Collapse sidebar" side="bottom">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </SidebarTooltip>
        </div>
      )}

      {/* Nav Menu */}
      <nav
        className={cn(
          "flex-1 py-4 space-y-1.5",
          isCollapsed ? "px-2.5 overflow-visible" : "px-3 overflow-y-auto"
        )}
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href + "/"));
          const Icon = item.icon;

          if (isCollapsed) {
            return (
              <SidebarTooltip key={item.href} text={item.label} side="right">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-[4px] transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </Link>
              </SidebarTooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Role Info */}
      {isCollapsed ? (
        <div className="p-3 border-t border-border flex items-center justify-center bg-muted/20">
          <SidebarTooltip text={`Signed in as ${role}`} side="right">
            <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-primary/10 text-primary text-xs font-bold uppercase cursor-default">
              {role.charAt(0)}
            </span>
          </SidebarTooltip>
        </div>
      ) : (
        <div className="p-4 border-t border-border text-xs text-muted-foreground bg-muted/20 truncate">
          Signed in as <span className="font-semibold text-foreground capitalize">{role}</span>
        </div>
      )}
    </aside>
  );
}
