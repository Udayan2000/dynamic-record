"use client";

import { LogOut, User as UserIcon } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { ThemeToggle } from "@/components/common/theme-toggle";
import { useLogout } from "@/hooks/use-auth";
import type { User } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function Topbar({ user, title }: { user: User; title?: string }) {
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-5 bg-[#fff] border-b border-[#f1f5fe]! mt-1 mb-1 ml-1 mr-1 rounded-sm">
      <h1 className="font-display text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        {/* <ThemeToggle /> */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="h-4 w-4" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-medium leading-none">{user.name}</span>
              <span className="block text-xs capitalize text-muted-foreground">{user.role}</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout.mutate()} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
