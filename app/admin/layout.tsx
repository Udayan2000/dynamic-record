import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side guard: redirects to /login if unauthenticated,
  // Now allows ANY authenticated user to access /admin/dashboard
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen  bg-[#e6ebf7]">
      <Sidebar role="admin" />
      <div className="flex flex-1 flex-col">
        <Topbar user={session.user} title="Admin" />
        <main className="flex-1 bg-muted/20 pl-1 pb-1 pr-1.5 pt-0">{children}</main>
      </div>
    </div>
  );
}