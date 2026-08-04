"use client";

import { useQuery } from "@tanstack/react-query";
import { recordsApi } from "@/services/templatebuilder-services";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, FolderOpenDot, Eye, Calendar, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RecordsPage() {
  const { data: records, isLoading, isError } = useQuery({
    queryKey: ["records"],
    queryFn: recordsApi.getRecords,
  });

  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load records.
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fff] border border-[#f1f5fe] rounded-sm p-4 min-h-[calc(100vh-80px)]">
      <div className="mb-6 flex items-center gap-3 border-b border-[#f1f5fe] pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FolderOpenDot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Submitted Records</h1>
          <p className="text-sm text-zinc-500">
            View all form submissions from your active templates.
          </p>
        </div>
      </div>

      {(!records || records.length === 0) ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
            <FolderOpenDot className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">No records found</h3>
          <p className="mt-1 text-sm text-zinc-500">
            When users submit data to your templates, they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-[#f1f5fe]">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-[#fafbff] text-xs uppercase text-zinc-500 border-b border-[#f1f5fe]">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Template</th>
                <th scope="col" className="px-6 py-4 font-medium">Recored</th>
                <th scope="col" className="px-6 py-4 font-medium">Date</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5fe] bg-white">
              {records.map((record: any) => (
                <tr key={record._id} className="hover:bg-[#fafbff] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {record.templateId?.image ? (
                        <img src={record.templateId.image} className="w-10 h-10 rounded object-cover border" alt="" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center border text-zinc-400">
                          <FolderOpenDot className="w-4 h-4" />
                        </div>
                      )}
                      <span className="font-medium text-zinc-900">{record.templateId?.name || "Unknown Template"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-xs text-zinc-500">{record.submitterEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span>{new Date(record.createdAt).toLocaleDateString()} {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedRecord(record)}
                      className="h-8 text-xs bg-white"
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0">
          <div className="p-6 pb-4 border-b bg-white z-10 flex-shrink-0">
            <DialogHeader>
              <DialogTitle>{selectedRecord?.templateId?.name} - Submission Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex flex-col md:flex-row gap-4 justify-between text-sm bg-muted/50 p-3 rounded-md">
              <div>
                <span className="font-semibold text-zinc-700">Submitted By:</span>
                <div className="text-zinc-600 mt-1">
                  {selectedRecord?.submitterName}<br />
                  {selectedRecord?.submitterEmail}
                </div>
              </div>
              <div className="md:text-right">
                <span className="font-semibold text-zinc-700">Date:</span>
                <div className="text-zinc-600 mt-1">
                  {selectedRecord && new Date(selectedRecord.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 pt-4 overflow-y-auto flex-1">
            <div className="space-y-4">
              <h3 className="font-semibold text-zinc-800 border-b pb-2">Form Data</h3>
              {selectedRecord?.data && Object.entries(selectedRecord.data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs font-bold uppercase text-zinc-500">{key}</Label>
                  <div className="text-sm text-zinc-800 bg-white border border-[#f1f5fe] rounded-sm p-2">
                    {Array.isArray(value) ? (
                      value.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {value.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                      ) : (
                        <span className="text-zinc-400 italic">None selected</span>
                      )
                    ) : (
                      value ? value : <span className="text-zinc-400 italic">No answer provided</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
