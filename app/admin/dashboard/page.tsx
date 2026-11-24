import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
    return (
        <section className="w-full bg-card border border-border rounded-sm  shadow-xs">
            <Card className="border-0 shadow-none p-0 bg-transparent px-3.5 sm:px-6 py-1.5 sm:py-3">
                <CardHeader className="p-0! gap-0!">
                    <CardTitle className="text-xl font-semibold tracking-tight text-foreground p-0!">Dashboard</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                        Welcome to the Admin Portal.
                    </CardDescription>
                </CardHeader>
            </Card>
        </section>
    );
}
