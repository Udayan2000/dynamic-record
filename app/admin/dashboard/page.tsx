import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpenDot, FileStack, AlertCircle } from "lucide-react";
const STATS = [
    { label: "Total employees", value: "128", icon: Users },
    { label: "Records this month", value: "342", icon: FolderOpenDot },
    { label: "Active templates", value: "14", icon: FileStack },
    { label: "Pending review", value: "9", icon: AlertCircle },
];
export default function AdminDashboardPage() {
    return (
        <div className="">
            <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2">

                <Card className=" border-0! shadow-none! p-0! bg-transparent!">
                    <CardHeader className="p-0!">
                        <CardTitle>Recent activity</CardTitle>
                        <CardDescription>Latest uploads and status changes across all employees.</CardDescription>
                    </CardHeader>

                </Card>
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {STATS.map((stat) => (
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
            <section className="grid grid-cols-2 gap-2 mt-2">
                <div className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">

                </div>

                <div className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">

                </div>
            </section>
            
        </div>
    );
}
