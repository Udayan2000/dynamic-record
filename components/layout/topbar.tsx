"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  FolderOpenDot,
  Users,
  FileStack,
  Settings,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { useLogout } from "@/hooks/use-auth";
import type { User } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Records", href: "/admin/records", icon: FolderOpenDot },
  { label: "Employees", href: "/admin/employees", icon: Users },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const EMPLOYEE_NAV = [
  { label: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { label: "Templates", href: "/admin/templates", icon: FileStack },
  { label: "Profile", href: "/employee/profile", icon: UserCircle },
];

export function Topbar({ user, title }: { user: User; title?: string }) {
  const logout = useLogout();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role || "admin";
  const navItems = role === "admin" ? ADMIN_NAV : EMPLOYEE_NAV;

  return (
    <>
      <header
        className="flex h-14 md:h-16 items-center justify-between border-b border-border px-3.5 sm:px-6 bg-card/95 backdrop-blur-md text-card-foreground shadow-xs m-0 rounded-none md:mt-2 md:mb-0! md:ml-2 md:mr-2 rounded-sm shrink-0 z-30 select-none"
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
            className="md:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>

          <h1 className="font-display text-sm sm:text-base md:text-lg font-semibold tracking-tight text-foreground truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 sm:gap-2 rounded-md p-1 sm:px-2 sm:py-1.5 text-sm hover:bg-muted text-foreground transition-colors cursor-pointer outline-none">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                <UserIcon className="h-4 w-4" />
              </span>
              <span className="hidden text-left sm:block">
                <span className="block font-medium text-xs leading-none text-foreground">{user?.name || "User"}</span>
                <span className="block text-[11px] capitalize text-muted-foreground mt-0.5">{user?.role || "Account"}</span>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative flex flex-col w-4/5 max-w-xs bg-card border-r border-border h-full p-4 shadow-xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <Logo href={role === "admin" ? "/admin/dashboard" : "/employee/dashboard"} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8 flex items-center justify-center rounded-[4px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href + "/"));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-[4px] px-3.5 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Role: <span className="font-semibold text-foreground capitalize">{role}</span>
              </div>
              <button
                onClick={() => logout.mutate()}
                className="inline-flex items-center gap-1.5 text-xs text-destructive hover:underline cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
