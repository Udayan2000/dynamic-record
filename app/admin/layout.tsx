import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
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
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={session.user} title="Admin Portal" />
        <main className="flex-1 bg-background p-2 pt-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
