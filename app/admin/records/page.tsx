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
    <div className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">
      {/* <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Records Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">Select a template to view its submitted records.</p>
        </div>
      </div> */}

      <Card className=" border-0! shadow-none! p-0! bg-transparent!">
        <CardHeader className="p-0!">
          <CardTitle>Records Hub</CardTitle>
          <CardDescription>Select a template to view its submitted records.</CardDescription>
        </CardHeader>

      </Card>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 gap-2 border border-dashed rounded-lg bg-zinc-50/50">
          <FolderOpenDot className="h-8 w-8 text-zinc-300" />
          <p className="font-medium text-zinc-500">No templates found</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex w-full flex-1 min-h-0 flex-col rounded-[10px] border border-[#bec1c7a1] bg-white mt-4">
            <div className="flex justify-between gap-2 border-b px-2 py-2">
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
              <div>
                
              </div>
            </div>
            <div className="w-full p-2 min-h-[calc(100vh-278px)] max-h-[calc(100vh-278px)] overflow-y-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="bg-[#fafbff] text-xs uppercase text-zinc-500 border-b border-[#f1f5fe]">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Template</th>
                    <th scope="col" className="px-6 py-4 font-medium">Total Records</th>
                    <th scope="col" className="px-6 py-4 font-medium">Status</th>
                    <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5fe] bg-white">
                  {templates.map((template: any) => {
                    const templateRecords = records.filter((r: any) =>
                      r.templateId?._id === template._id || r.templateId === template._id
                    );

                    return (
                      <tr key={template._id} className="hover:bg-[#fafbff] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {template.image && template.image !== "CAMERA_ENABLED" ? (
                              <img src={template.image} className="w-10 h-10 rounded object-cover border" alt="" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center border text-zinc-400">
                                <FolderOpenDot className="w-4 h-4" />
                              </div>
                            )}
                            <span className="font-medium text-zinc-900">{template.name || "Untitled Template"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-800 bg-zinc-100 px-2 py-1 rounded-md">
                              {templateRecords.length}
                            </span>
                            <span className="text-xs text-zinc-500">Submissions</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${template.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {template.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => router.push(`/admin/records/${template._id}`)}
                            className="h-8 text-xs shadow-sm cursor-pointer"
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" /> View Data
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center gap-2 px-4 py-3 border-t">
              <Pagination
                currentPage={page}
                totalItems={totalTemplates}
                itemsPerPage={10}
                onPageChange={setPage}
                showSummary={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
