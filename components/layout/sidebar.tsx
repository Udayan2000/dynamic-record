"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileStack,
  FolderOpenDot,
  BarChart3,
  Settings,
  UploadCloud,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Logo } from "@/components/common/logo";
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
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const EMPLOYEE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/employee/upload", icon: UploadCloud },
  { label: "My Records", href: "/employee/records", icon: FolderOpenDot },
  { label: "Profile", href: "/employee/profile", icon: UserCircle },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "admin" ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border  border-[#e7e9f6]! bg-[#fff] md:flex  mt-1 mb-1 ml-1 mr-0 rounded-sm">
      <div className="flex h-16 items-center px-4">
        {/* <Logo /> */}
      </div>
      <nav className="flex-1 space-y-1 px-4 py-2 h-[200px] overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 text-xs text-muted-foreground">
        Signed in as <span className="font-medium capitalize">{role}</span>
      </div>
    </aside>
  );
}
