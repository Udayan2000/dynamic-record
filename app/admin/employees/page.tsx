import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Adminemployeepage from "./component/Adminemployeepage";

export default function EmployeesPage() {
    return (
        <section className="w-full bg-card border border-border rounded-sm p-4 shadow-xs">
            <Card className=" border-0! shadow-none! p-0! bg-transparent! mb-2!">
                <CardHeader className="p-0!">
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage profiles, roles, and access.</CardDescription>
                </CardHeader>

            </Card>
          

            <Adminemployeepage/>
        </section>
    )
}