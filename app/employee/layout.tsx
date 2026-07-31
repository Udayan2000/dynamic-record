import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#e6ebf7]">
      <Sidebar role="employee" />
      <div className="flex flex-1 flex-col">
        <Topbar user={session.user} title="Employee Dashboard" />
        <main className="flex-1 bg-muted/20 pl-1 pb-1 pr-1.5 pt-0">{children}</main>
      </div>
    </div>
  );
}
