"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FolderOpenDot, Eye } from "lucide-react";
import { recordsApi, templatesApi } from "@/services/templatebuilder-services";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

export default function RecordsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  
  const { data: recordsData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["records_all"],
    queryFn: () => recordsApi.getRecords({ limit: 10000 }),
  });
  
  const records = recordsData?.records || [];

  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates", page],
    queryFn: () => templatesApi.getTemplates({ page, limit: 10 }),
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
    <div className="flex h-full flex-col p-4 bg-white m-2 rounded-xl shadow-sm border border-zinc-100 min-h-[calc(100vh-64px)]">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Records Hub</h1>
          <p className="text-sm text-zinc-500 mt-1">Select a template to view its submitted records.</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] text-zinc-500 gap-2 border border-dashed rounded-lg bg-zinc-50/50">
          <FolderOpenDot className="h-8 w-8 text-zinc-300" />
          <p className="font-medium text-zinc-500">No templates found</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="overflow-x-auto rounded-md border border-[#f1f5fe] flex-1">
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
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalItems={totalTemplates}
              itemsPerPage={10}
              onPageChange={setPage}
              showSummary={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
