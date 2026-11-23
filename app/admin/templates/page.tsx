import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Admintemplatepage from "./component/Admintemplatepage";

export default function TemplatesPage(){
      return (
        <section className="w-full bg-card border border-border rounded-lg p-4 shadow-xs">
             <Card className=" border-0! shadow-none! p-0! bg-transparent! mb-2!">
                <CardHeader className="p-0!">
                    <CardTitle>Template</CardTitle>
                    <CardDescription>Manage Template.</CardDescription>
                </CardHeader>

            </Card>
            <Admintemplatepage/>
        </section>
      );
}