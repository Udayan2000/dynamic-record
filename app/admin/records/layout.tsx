import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RecordsLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role === "employee") {
    redirect("/admin/templates");
  }

  return <>{children}</>;
}
