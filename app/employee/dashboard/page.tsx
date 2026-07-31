import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpenDot, UploadCloud, Edit3, ShieldAlert, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataActionHub } from "@/components/dashboard/data-action-hub";

const EMPLOYEE_STATS = [
    { label: "My Uploaded Records", value: "48", icon: FolderOpenDot },
    { label: "Pending Edits", value: "3", icon: Edit3 },
    { label: "Recent Submissions", value: "12", icon: UploadCloud },
];

export default function EmployeeDashboardPage() {
    return (
        <div className="space-y-2">
            {/* Employee Activity Stats */}
            <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2">
                <Card className="border-0! shadow-none! p-0! bg-transparent!">
                    <CardHeader className="p-0!">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>User Workspace Dashboard</CardTitle>
                                <CardDescription>Manage your uploads, edits, and view record submissions.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                Role: Standard User
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
                    {EMPLOYEE_STATS.map((stat) => (
                        <Card key={stat.label} className="shadow-none!">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-semibold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Role Capabilities Notice for User */}
            <section className="w-full bg-white border border-[#f1f5fe]! rounded-sm p-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold">User Role Capabilities & Restrictions</h3>
                            <span className="text-xs text-muted-foreground">Admin Supervised</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            As a standard User, you are authorized to <strong>Upload</strong>, <strong>Edit</strong>, and <strong>View</strong> dynamic record data.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 text-xs">
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Upload Data: Enabled
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Edit Data: Enabled
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> View Data: Enabled
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                <Lock className="h-3 w-3 text-slate-400" /> Delete Data: Admin Only
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                <Lock className="h-3 w-3 text-slate-400" /> Google Drive Sync: Admin Only
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Actions for User */}
            <section className="w-full">
                <DataActionHub role="employee" />
            </section>
        </div>
    );
}
