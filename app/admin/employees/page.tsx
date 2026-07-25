import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Adminemployeepage from "./component/Adminemployeepage";

export default function EmployeesPage() {
    return (
        <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">
            <Card className=" border-0! shadow-none! p-0! bg-transparent!">
                <CardHeader className="p-0!">
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage profiles, roles, and access.</CardDescription>
                </CardHeader>

            </Card>
          

            <Adminemployeepage/>
        </section>
    )
}