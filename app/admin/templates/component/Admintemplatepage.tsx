"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { templatesApi } from "@/services/templatebuilder-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileStack, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Admintemplatepage() {
    const router = useRouter();

    const { data: templates = [], isLoading } = useQuery({
        queryKey: ["templates"],
        queryFn: templatesApi.getTemplates,
    });

    return (
        <>
            <div className="w-full rounded-[10px] border border-[#bec1c7a1]! bg-white mt-4 min-h-[500px]">
                <div className="flex justify-start gap-2 border-b px-2 py-2">
                    <div className="w-full max-w-[400px]">
                        <Input id="search-template" type="text" placeholder="Search templates..." />
                    </div>
                    <div>
                        <Button 
                            type="button" 
                            className="w-full cursor-pointer" 
                            variant="default"   
                            onClick={() => router.push("/admin/templates/newtemplate")}
                        >
                            Add Template
                        </Button>
                    </div>
                </div>
                
                <div className="w-full p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[300px] text-zinc-500">
                            Loading templates...
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 gap-2">
                            <Inbox className="h-8 w-8 text-zinc-300" />
                            <p className="font-medium text-zinc-500">No templates found</p>
                            <p className="text-xs text-zinc-400">Click &apos;Add Template&apos; to create one.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {templates.map((template) => (
                                <Card key={template._id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group">
                                    <div className="h-32 bg-zinc-100 flex items-center justify-center border-b">
                                        {template.image ? (
                                            <img 
                                                src={template.image} 
                                                alt={template.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <FileStack className="h-12 w-12 text-zinc-300" />
                                        )}
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-medium truncate pr-2 group-hover:text-primary transition-colors">
                                                {template.name || "Untitled Template"}
                                            </CardTitle>
                                            <Badge variant={template.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                                                {template.status}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs mt-1">
                                            {template.fields?.length || 0} Fields • {template.access?.length || 0} Access
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
           
        </>
    )
}