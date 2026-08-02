"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesApi } from "@/services/templatebuilder-services";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileStack, Inbox, Eye, MoreVertical, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";

export default function Admintemplatepage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data: responseData, isLoading } = useQuery({
        queryKey: ["templates", debouncedSearch, page, perPage],
        queryFn: () => templatesApi.getTemplates({ search: debouncedSearch, page, limit: perPage }),
    });
    
    const templates = responseData?.templates || [];
    const totalItems = responseData?.totalItems || 0;

    const handlePerPageChange = (val: string) => {
        setPerPage(Number(val));
        setPage(1);
    };

    const statusMutation = useMutation({
        mutationFn: templatesApi.toggleTemplateStatus,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success(data.message || "Template status updated");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "Failed to update status");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: templatesApi.deleteTemplate,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            toast.success(data.message || "Template deleted successfully");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "Failed to delete template");
        }
    });

    return (
        <>
            <div className="flex flex-col">
            <div className="flex w-full flex-1 min-h-0 flex-col rounded-[10px] border border-[#bec1c7a1] bg-white mt-4">
                <div className="flex justify-between gap-2 border-b px-2 py-2">
                    <div className="w-full max-w-[400px]">
                        <Input 
                            id="search-template" 
                            type="text" 
                            placeholder="Search templates..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                
                <div className="w-full p-2 min-h-[calc(100vh-278px)] max-h-[calc(100vh-278px)] overflow-y-auto">
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
                            {templates.map((template: any) => (
                                <Card 
                                    key={template._id} 
                                    className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group" 
                                    onClick={() => router.push(`/admin/templates/${template._id}`)}
                                >
                                    <div className="h-32 bg-zinc-100 flex items-center justify-center border-b relative">
                                        {template.image ? (
                                            <img 
                                                src={template.image} 
                                                alt={template.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <FileStack className="h-12 w-12 text-zinc-300" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                            <span className="text-white font-medium text-sm flex items-center gap-2">
                                                <Eye className="w-4 h-4" /> View Template
                                            </span>
                                        </div>
                                    </div>
                                    <CardHeader className="p-4">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-medium truncate pr-2 group-hover:text-primary transition-colors">
                                                {template.name || "Untitled Template"}
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={template.status === 'active' ? 'default' : 'secondary'} className="text-[10px] py-1 px-2 rounded-sm">
                                                    {template.status}
                                                </Badge>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4 text-zinc-500" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => router.push(`/admin/templates/${template._id}/upload`)}>
                                                                <UploadCloud className="mr-2 h-4 w-4" /> Upload
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => statusMutation.mutate({ id: template._id, status: template.status === 'active' ? 'inactive' : 'active' })}>
                                                                Mark {template.status === 'active' ? 'Inactive' : 'Active'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deleteMutation.mutate(template._id)}>
                                                                Delete Template
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        </div>
                                        <CardDescription className="text-xs mt-1 flex justify-between items-center">
                                            <span>{template.fields?.length || 0} Fields • {template.access?.length || 0} Access</span>
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                  <div className="flex justify-between items-center gap-2 px-4 py-3 border-t">
                                    <Pagination
                                        currentPage={page}
                                        totalItems={totalItems}
                                        itemsPerPage={perPage}
                                        onPageChange={setPage}
                                    />
                                    <PerPageSelect value={String(perPage)} onChange={handlePerPageChange} />
                                </div>
            </div>
            </div>
           
        </>
    )
}