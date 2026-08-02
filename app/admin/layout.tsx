import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { cookies } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value || session.user?.role || "admin";

  return (
    <div className="flex h-screen bg-[#e6ebf7] overflow-hidden">
      <Sidebar role={role as any} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar user={session.user} title="Admin" />
        <main className="flex-1 bg-muted/20 pl-1 pb-1 pr-1.5 pt-0 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}