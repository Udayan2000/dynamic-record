import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Admintemplatepage from "./component/Admintemplatepage";

export default function TemplatesPage(){
      return (
        <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 ">
             <Card className=" border-0! shadow-none! p-0! bg-transparent!">
                <CardHeader className="p-0!">
                    <CardTitle>Template</CardTitle>
                    <CardDescription>Manage Template.</CardDescription>
                </CardHeader>

            </Card>
            <Admintemplatepage/>
        </section>
      );
}