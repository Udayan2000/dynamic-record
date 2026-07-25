"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function Admintemplatepage() {
      const router = useRouter();
    return (
        <>
           
                <div className="w-full rounded-[10px] border border-[#bec1c7a1]! bg-white  mt-4 max-h-[calc(100vh-400px)]">
                    <div className="flex justify-start gap-2 border-b px-2 py-2">
                        <div className="w-full max-w-[400px]">
                            <Input id="search template....." type="name" placeholder="search template..." />
                        </div>
                        <div className="">
                            <Button type="submit" className="w-full cursor-pointer" variant="default"   onClick={() => router.push("/admin/templates/newtemplate")}>
                                Add Template
                            </Button>
                        </div>
                    </div>
                     <div className="w-full grid px-2 pt-2 pb-2">
                     
                     </div>
                </div>
           
        </>
    )
}