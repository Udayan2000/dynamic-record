import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDashboardPage() {
    return (
        <section className="w-full bg-card border border-border rounded-lg p-6 shadow-xs">
            <Card className="border-0 shadow-none p-0 bg-transparent">
                <CardHeader className="p-0">
                    <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Dashboard</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                        Welcome to your Employee Workspace.
                    </CardDescription>
                </CardHeader>
            </Card>
        </section>
    );
}
