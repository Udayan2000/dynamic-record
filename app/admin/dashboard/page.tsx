import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpenDot, FileStack, AlertCircle } from "lucide-react";
import { GoogleDriveExporter } from "@/components/dashboard/google-drive-exporter";
import { RolePermissionMatrix } from "@/components/dashboard/role-permission-matrix";
import { DataActionHub } from "@/components/dashboard/data-action-hub";

const STATS = [
    { label: "Total employees", value: "128", icon: Users },
    { label: "Records this month", value: "342", icon: FolderOpenDot },
    { label: "Active templates", value: "14", icon: FileStack },
    { label: "Todays Record", value: "9", icon: AlertCircle },
];

export default function AdminDashboardPage() {
    return (
        <div className="">
            {/* Recent Activity Section - preserved without changes */}
            <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2">
                <Card className=" border-0! shadow-none! p-0! bg-transparent!">
                    <CardHeader className="p-0!">
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>Latest uploads and status changes across all employees.</CardDescription>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {STATS.map((stat) => (
                        <Card key={stat.label} className="shadow-none! p-2!">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0!">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-0!">
                                <div className="text-[20px] font-semibold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="max-h-[calc(100vh-223px)] overflow-y-auto bg-[#fff] mt-2 rounded-sm p-2">
                {/* Google Drive Export & Cloud Sync + Role Capabilities Matrix */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-2 ">
                    <div className="w-full rounded-sm h-full">
                        <GoogleDriveExporter />
                    </div>

                    <div className="w-full rounded-sm h-full">
                        <RolePermissionMatrix />
                    </div>
                </section>

                {/* Data Operations Hub */}
                <section className="w-full">
                    <DataActionHub role="admin" />
                </section>
            </div>
        </div>
    );
}
