import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Dynamic Records",
  description: "Manage templates, records, and employee access securely.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value || session.user?.role || "admin";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar role={role as any} />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full relative">
        <Topbar user={session.user} title="Admin Portal" />
        <main className="flex-1 bg-background p-2 sm:p-3 md:p-2 pt-2.5 sm:pt-3 md:pt-2 pb-20 md:pb-2 overflow-y-auto min-w-0 w-full overscroll-contain">
          {children}
        </main>
        <MobileBottomNav role={role as any} />
      </div>
    </div>
  );
}
