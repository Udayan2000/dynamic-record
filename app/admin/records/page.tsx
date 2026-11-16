"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FolderOpenDot, Eye } from "lucide-react";
import { recordsApi, templatesApi } from "@/services/templatebuilder-services";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function RecordsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: recordsData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["records_all"],
    queryFn: () => recordsApi.getRecords({ limit: 10000 }),
  });

  const records = recordsData?.records || [];

  const { data: templatesData, isLoading: isLoadingTemplates, isFetching: isFetchingTemplates } = useQuery({
    queryKey: ["templates", page, debouncedSearch],
    queryFn: () => templatesApi.getTemplates({ search: debouncedSearch, page, limit: 10 }),
  });

  const templates = templatesData?.templates || [];
  const totalTemplates = templatesData?.totalItems || 0;

  const isLoading = isLoadingRecords || isLoadingTemplates;

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg p-3 sm:p-4 shadow-xs">
      <div className="mb-2">
        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">Records Hub</h1>
        <p className="text-xs text-muted-foreground">Select a template to view, search, and export its submitted records.</p>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2 border border-dashed border-border rounded-lg bg-muted/20 mt-4">
          <FolderOpenDot className="h-8 w-8 text-muted-foreground/50" />
          <p className="font-medium text-foreground">No templates found</p>
          <p className="text-xs text-muted-foreground">Create a template first to start collecting records.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex w-full flex-1 min-h-0 flex-col rounded-lg border border-border bg-card text-card-foreground shadow-xs mt-3 overflow-hidden">
            <div className="flex justify-between items-center gap-2 border-b border-border p-3 sm:p-4 bg-card">
              <div className="w-full max-w-[400px]">
                <Input
                  id="search-template"
                  type="search"
                  placeholder="Search templates..."
                  isLoading={searchTerm !== debouncedSearch || isFetchingTemplates}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onDebouncedChange={(value) => {
                    setDebouncedSearch(value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
            <div className="w-full h-[calc(100vh-287px)] overflow-y-auto overflow-x-auto relative table-scrollbar">
              <table className="w-full text-left text-sm text-foreground whitespace-nowrap min-w-[700px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted border-b border-border shadow-xs">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0">Template</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0">Total Records</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0">Status</th>
                    <th scope="col" className="px-6 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {templates.map((template: any) => {
                    const templateRecords = records.filter((r: any) => 
                      r.templateId?._id === template._id || r.templateId === template._id
                    );
                    return (
                      <tr 
                        key={template._id} 
                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/admin/records/${template._id}`)}
                      >
                        <td className="px-6 py-3.5 font-medium flex items-center gap-3">
                          <div className="h-8 w-8 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FolderOpenDot className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-foreground text-sm block group-hover:text-primary transition-colors">{template.name}</span>
                            <span className="text-xs text-muted-foreground">{template.fields?.length || 0} fields</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">
                          <span className="font-semibold text-foreground">{templateRecords.length}</span> submissions
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant={template.status === "active" ? "default" : "secondary"} className="capitalize text-xs">
                            {template.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/records/${template._id}`);
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Records
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 px-3 sm:px-4 py-3 border-t border-border bg-card">
              <Pagination
                currentPage={page}
                totalItems={totalTemplates}
                itemsPerPage={10}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
