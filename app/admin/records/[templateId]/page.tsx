"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { templatesApi, recordsApi } from "@/services/templatebuilder-services";
import { Template } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2,
  ArrowLeft,
  Search,
  Download,
  Image as ImageIcon,
  Calendar,
  CloudDownload
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplateRecordsPage({ params }: { params: Promise<{ templateId: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTemplateId(p.templateId));
  }, [params]);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.getTemplateById(templateId as string),
    enabled: !!templateId,
  });

  const { data: recordsData, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["records", templateId, page, debouncedSearch],
    queryFn: () => recordsApi.getRecords({ templateId: templateId as string, search: debouncedSearch, page, limit: 10 }),
    enabled: !!templateId,
  });

  const isLoading = isLoadingTemplate || isLoadingRecords;
  const filteredRecords = recordsData?.records || [];
  const totalItems = recordsData?.totalItems || 0;

  const handleExportCSV = async () => {
    if (!template) return;

    toast.loading("Preparing CSV...", { id: "csv-export" });
    try {
      const exportData = await recordsApi.getRecords({ templateId: templateId as string, search: debouncedSearch, limit: 10000 });
      const recordsToExport = exportData.records;

      if (recordsToExport.length === 0) {
        toast.dismiss("csv-export");
        toast.error("No records to export.");
        return;
      }

      // Define standard headers
      const headers = ["Submitted By", "Email", "Date Submitted"];

      // Add dynamic field headers
      template.fields.forEach((f) => headers.push(f.label));
      if (template.cameraAccess) headers.push("Attached Photo");

      // Map rows
      const rows = recordsToExport.map((record: any) => {
        const rowData = [
          `"${record.submitterName || ""}"`,
          `"${record.submitterEmail || ""}"`,
          `"${new Date(record.createdAt).toLocaleString()}"`,
        ];

        template.fields.forEach((f) => {
          const val = record.data?.[f.label];
          if (Array.isArray(val)) {
            rowData.push(`"${val.join(", ")}"`);
          } else {
            rowData.push(`"${val || ""}"`);
          }
        });

        if (template.cameraAccess) {
          const photo = record.data?.["Attached Photo"];
          rowData.push(`"${photo ? "Image Attached" : "None"}"`);
        }

        return rowData.join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${template.name}_Records.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Exported successfully", { id: "csv-export" });
    } catch (error) {
      toast.error("Failed to prepare CSV", { id: "csv-export" });
    }
  };

  const handleExportDrive = async () => {
    if (!template) return;

    try {
      setIsExporting(true);
      toast.loading("Exporting to Google Drive...", { id: "drive-export" });

      const response = await fetch('/api/drive/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: template.name,
          templateId: templateId as string,
          search: debouncedSearch,
          fields: template.fields,
          hasCameraAccess: template.cameraAccess
        })
      });

      if (response.status === 401) {
        toast.dismiss("drive-export");
        toast.info("Redirecting to Google for authentication...");
        window.location.href = '/api/auth/google';
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || 'Upload failed');
      }

      toast.success("Successfully exported to Google Drive!", { id: "drive-export" });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("An error occurred during export", { id: "drive-export" });
    } finally {
      setIsExporting(false);
    }
  };

  if (!templateId || isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-8 text-center text-red-500">
        Template not found.
      </div>
    );
  }

  return (
    <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">
      {/* <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/records')} className="shrink-0 text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">{template.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">Viewing {filteredRecords.length} of {totalItems} submissions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full"
            />
          </div>
          {user?.role === "admin" && (
            <>
              <Button onClick={handleExportDrive} disabled={isExporting} variant="outline" className="h-10 shrink-0 border-violet-200 hover:bg-violet-50 text-violet-600 hover:text-violet-700">
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />} 
                Drive Export
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="h-10 shrink-0">
                <Download className="mr-2 h-4 w-4" /> CSV
              </Button>
            </>
          )}
        </div>
      </div> */}

      <Card className=" border-0! shadow-none! p-0! bg-transparent!">
        <CardHeader className="p-0!">
          <CardTitle className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/records')} className="shrink-0 text-zinc-500 hover:text-zinc-900 bg-[#e7ecf7]">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none tracking-tight">{template.name}</h1>
              <p className="text-sm text-zinc-500 mt-1">Viewing {filteredRecords.length} of {totalItems} submissions</p>

            </div>
          </CardTitle>


        </CardHeader>

      </Card>

      <div className="flex flex-col">
        <div className="flex w-full flex-1 min-h-0 flex-col rounded-[10px] border border-[#bec1c7a1] bg-white mt-4">
          <div className="flex flex-col sm:flex-row justify-between gap-2 border-b px-4 py-3">
            <div className="w-full max-w-[400px]">
              {/* <Input id="employe_search" type="name" placeholder="Search Employees..." /> */}
              <Input
                type="search"
                placeholder="Search records..."
                // isLoading={isSearching}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              {user?.role === "admin" && (
                <>
                  <Button onClick={handleExportDrive} disabled={isExporting} variant="default" className="h-10 shrink-0 text-white">
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />}
                    Drive Export
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" className="h-10 shrink-0">
                    <Download className="mr-2 h-4 w-4" /> CSV
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid w-full p-1">
            <div className="h-[calc(100vh-287px)] overflow-y-auto overflow-x-auto w-full">
              <table className="w-full text-left text-sm text-zinc-600 whitespace-nowrap">
                <thead className="sticky top-0 z-10 bg-[#e7ecf7] text-left text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 font-medium">Submitted By</th>
                     {template.cameraAccess && (
                      <th scope="col" className="px-3 py-2.5 font-mediumtext-center">Photo</th>
                    )}
                    <th scope="col" className="px-3 py-2.5 font-medium">Date</th>

                   

                    {/* Dynamic Columns */}
                    {template.fields.map((f) => (
                      <th key={f.id} scope="col" className="px-3 py-2.5 font-medium max-w-[200px] truncate" title={f.label}>
                        {f.label}
                      </th>
                    ))}

                    {/* Camera Column */}
                    
                  </tr>
                </thead>
                <tbody className="">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={template.fields.length + 3} className="px-3 py-2.5 text-center text-zinc-500">
                        No records match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record: any) => (
                      <tr key={record._id} className="border-b border-[#f1f5fe] hover:bg-[#fafbff]">
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-900">{record.submitterName}</span>
                            <span className="text-xs text-zinc-500">{record.submitterEmail}</span>
                          </div>
                        </td>

                         {template.cameraAccess && (
                          <td className="px-3 py-2.5 text-center">
                            {record.data?.["Attached Photo"] ? (
                              <button
                                onClick={() => setSelectedImage(record.data["Attached Photo"])}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors shadow-sm overflow-hidden"
                                title="View Photo"
                              >
                                <img src={record.data["Attached Photo"]} className="h-full w-full object-cover" alt="Record attachment" />
                              </button>
                            ) : (
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {/* Dynamic Cell Data */}
                        {template.fields.map((f) => {
                          const val = record.data?.[f.label];
                          return (
                            <td key={f.id} className="px-3 py-2.5 max-w-[200px] truncate" title={Array.isArray(val) ? val.join(", ") : val}>
                              {Array.isArray(val) ? (
                                val.length > 0 ? (
                                  <span className="text-zinc-800">{val.join(", ")}</span>
                                ) : (
                                  <span className="text-zinc-300 italic">-</span>
                                )
                              ) : (
                                val ? <span className="text-zinc-800">{val}</span> : <span className="text-zinc-300 italic">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Camera Cell */}
                       
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 px-4 py-3 border-t">
            {/* <Pagination
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={10}
              onPageChange={setPage}
              showSummary={true}
            /> */}

                                <Pagination
                                    currentPage={page}
                                    totalItems={totalItems}
                                     itemsPerPage={10}
                                    onPageChange={setPage}
                                     showSummary={true}
                                />
                                <PerPageSelect value={10}  />
          </div>

        </div>

      </div>

      {/* Full Image View Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-3xl border-0 p-0 overflow-hidden bg-transparent shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          <div className="relative group w-full h-[80vh] flex items-center justify-center bg-black/90">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size attachment"
                className="max-w-full max-h-full object-contain"
              />
            )}
            <Button
              variant="secondary"
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
