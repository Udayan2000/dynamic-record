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
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar role="employee" />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full">
        <Topbar user={session.user} title="Employee Workspace" />
        <main className="flex-1 bg-background p-1.5 sm:p-2 pt-0 overflow-y-auto min-w-0 w-full">{children}</main>
      </div>
    </div>
  );
}
