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
            {/* <div className="grid w-full mt-2">
                <div className="border border-[#f1f5fe] w-full rounded-sm">
                    <div className="p-2 flex justify-start gap-2 border-b">
                        <div className="w-full max-w-[400px]">
                            <Input id="employe_search" type="name" placeholder="Search Employees..." />
                        </div>
                        <div className="">
                            <Button type="submit" className="w-full cursor-pointer" variant="default">
                                Add Employee
                            </Button>
                        </div>
                    </div>
                    <div className="w-full">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="border-b">
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[220px] text-left">Name</td>
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[240px] text-left">Email</td>
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[340px] text-left">Address</td>
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[180px] text-left">
                                        Records Upload
                                    </td>
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[190px] text-center">
                                        Status
                                    </td>
                                    <td className="py-2 px-2 text-[16px] font-[400] text-[#355179] w-[120px] text-right">Action</td>
                                </tr>
                            </thead>
                            <tbody className="">
                                <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>

                                  <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>

                                  <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>

                                  <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>
                                  <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>
                                  <tr>
                                    <td className="py-2 px-2">Udayan Ghosh</td>
                                    <td className="py-2 px-2">test@gmail.com</td>

                                    <td className="py-2 px-2">Tarakeswar,Hooghly</td>
                                    <td className="py-2 px-2 text-left">540</td>
                                    <td className="py-2 px-2 text-center">Active</td>
                                    <td className="py-2 px-2"></td>
                                </tr>
                               
                            </tbody>
                        </table>
                    </div>
                </div>
            </div> */}

            <Adminemployeepage/>
        </section>
    )
}