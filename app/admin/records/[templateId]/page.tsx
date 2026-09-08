"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesApi, recordsApi } from "@/services/templatebuilder-services";
import { Template } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Calendar,
  CloudDownload,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  Camera,
  RotateCw,
  Upload,
  Save,
  Trash2
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

function UserImageCapture({
  image,
  onImageChange,
  height,
}: {
  image: string | null;
  onImageChange: (src: string | null) => void;
  height: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function startCamera(mode: "user" | "environment" = facingMode) {
    setError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 50);
    } catch {
      setError("Camera access was denied or isn't available on this device.");
    }
  }

  function flipCamera() {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    onImageChange(canvas.toDataURL("image/png"));
    stopCamera();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function rotateImage() {
    if (!image) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      onImageChange(canvas.toDataURL("image/png"));
    };
    img.src = image;
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-3 rounded-md border border-zinc-200 p-4 bg-zinc-50/50">
      <Label className="text-sm font-medium mb-2! block">Capture or Upload Photo</Label>

      {(cameraOpen || image) && (
        <div className="relative overflow-hidden rounded-md border bg-zinc-50" style={{ height }}>
          {cameraOpen ? (
            <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
          ) : image ? (
            <img src={image} alt="Captured" className="h-full w-full object-contain" />
          ) : null}
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {!cameraOpen ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => startCamera()}>
              <Camera className="mr-1.5 h-3.5 w-3.5" /> Use Camera
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Photo
            </Button>
            {image && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={rotateImage}>
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Rotate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onImageChange(null)}>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Delete
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button type="button" size="sm" onClick={capturePhoto}>
              Capture
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={flipCamera}>
              <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Flip Camera
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>
              Cancel
            </Button>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function EditRecordForm({ template, record, onSave, onCancel, isPending }: any) {
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: any = {};
    if (template && record && record.data) {
      template.fields.forEach((f: any) => {
        const fieldId = f._id || f.id;
        initial[fieldId] = record.data[f.label];
      });
      if (template.cameraAccess) {
        initial.userImage = record.data["Attached Photo"] || null;
      }
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, value] };
      } else {
        return { ...prev, [fieldId]: current.filter((v: string) => v !== value) };
      }
    });
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    template.fields.forEach((field: any) => {
      const fieldId = field._id || field.id;
      if (field.required) {
        const val = formData[fieldId];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[fieldId] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields.");
      return;
    }

    const submissionData: Record<string, any> = {};
    template.fields.forEach((field: any) => {
      const fieldId = field._id || field.id;
      submissionData[field.label] = formData[fieldId] || (field.type === 'multiselect' ? [] : "");
    });

    if (template.cameraAccess && formData.userImage) {
      submissionData['Attached Photo'] = formData.userImage;
    }

    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      {template.cameraAccess && (
        <UserImageCapture
          image={formData.userImage || null}
          onImageChange={(img) => handleInputChange("userImage", img)}
          height={template.imageHeight || 220}
        />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-h-[50vh] overflow-y-auto px-1 pb-4">
        {template.fields.map((field: any) => {
          const fieldId = field._id || field.id;
          return (
            <div key={fieldId} className="space-y-2">
              <Label className="text-sm font-medium mb-2! block">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  value={formData[fieldId] || ""}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  className={errors[fieldId] ? "ring-0 border-red-500" : ""}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  value={formData[fieldId] || ""}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  rows={3}
                  className={errors[fieldId] ? "border-red-500" : ""}
                />
              )}

              {field.type === "dropdown" && (
                <select
                  value={formData[fieldId] || ""}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors[fieldId] ? "border-red-500" : ""}`}
                >
                  <option value="">Select an option</option>
                  {field.options.map((opt: string, i: number) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === "radio" && (
                <div className="flex flex-col gap-2 mt-2">
                  {field.options.map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={fieldId}
                        value={opt}
                        checked={formData[fieldId] === opt}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {field.type === "multiselect" && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.options.map((opt: string, i: number) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        value={opt}
                        checked={(formData[fieldId] || []).includes(opt)}
                        onChange={(e) => handleCheckboxChange(fieldId, opt, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {errors[fieldId] && (
                <p className="text-xs text-red-500 mt-1">{errors[fieldId]}</p>
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function TemplateRecordsPage({ params }: { params: Promise<{ templateId: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTemplateId(p.templateId));
  }, [params]);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Modal States
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);

  const { data: template, isLoading: isLoadingTemplate } = useQuery<Template>({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.getTemplateById(templateId as string),
    enabled: !!templateId,
  });

  const { data: recordsData, isLoading: isLoadingRecords, isFetching: isFetchingRecords } = useQuery({
    queryKey: ["records", templateId, page, debouncedSearch, perPage],
    queryFn: () => recordsApi.getRecords({ templateId: templateId as string, search: debouncedSearch, page, limit: perPage }),
    enabled: !!templateId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recordsApi.deleteRecord(id),
    onSuccess: () => {
      toast.success("Record deleted successfully");
      setDeleteRecordId(null);
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete record");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => recordsApi.updateRecord(data.id, data.payload),
    onSuccess: () => {
      toast.success("Record updated successfully");
      setEditRecord(null);
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update record");
    }
  });

  const isLoading = isLoadingTemplate || isLoadingRecords;
  const isSearching = searchQuery !== debouncedSearch || isFetchingRecords;
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

      const headers = ["Submitted By", "Email", "Date Submitted"];
      template.fields.forEach((f) => headers.push(f.label));
      if (template.cameraAccess) headers.push("Attached Photo");

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

  const handlePerPageChange = (value: string | number) => {
    setPerPage(Number(value));
    setPage(1);
  };

  return (
    <section className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2 h-full">

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
              <Input
                type="search"
                placeholder="Search records..."
                isLoading={isSearching}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onDebouncedChange={(value) => {
                  setDebouncedSearch(value);
                  setPage(1);
                }}
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
                    
                    {template.fields.map((f) => (
                      <th key={f.id} scope="col" className="px-3 py-2.5 font-medium max-w-[200px] truncate" title={f.label}>
                        {f.label}
                      </th>
                    ))}
                    
                    <th scope="col" className="px-3 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={template.fields.length + 4} className="px-3 py-2.5 text-center text-zinc-500">
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

                        <td className="px-3 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4 text-zinc-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setTimeout(() => setViewRecord(record), 0)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setEditRecord(record), 0)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setDeleteRecordId(record._id), 0)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                <Trash className="mr-2 h-4 w-4" /> Delete Record
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 px-4 py-3 border-t">
            <Pagination
              currentPage={page}
              totalItems={totalItems}
              itemsPerPage={perPage}
              onPageChange={setPage}
            />
            <PerPageSelect value={perPage} onChange={handlePerPageChange} />
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
              className="absolute top-4 right-4 transition-opacity"
              onClick={() => setSelectedImage(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Submitted By</p>
                <p className="text-sm text-zinc-900 mt-1">{viewRecord?.submitterName}</p>
                <p className="text-xs text-zinc-500">{viewRecord?.submitterEmail}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Submission Date</p>
                <p className="text-sm text-zinc-900 mt-1">{viewRecord && new Date(viewRecord.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-zinc-900 border-b pb-2">Form Data</h4>
              {template?.fields.map((f: any) => {
                const val = viewRecord?.data?.[f.label];
                return (
                  <div key={f.id} className="grid grid-cols-3 gap-2 border-b border-zinc-100 pb-2">
                    <p className="text-sm text-zinc-500 font-medium col-span-1">{f.label}</p>
                    <div className="col-span-2 text-sm text-zinc-900 font-medium">
                      {Array.isArray(val) ? (
                        val.length > 0 ? val.join(", ") : <span className="text-zinc-400 italic">None</span>
                      ) : (
                        val || <span className="text-zinc-400 italic">None</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {template?.cameraAccess && (
                <div className="pt-2">
                  <p className="text-sm text-zinc-500 font-medium mb-2">Attached Photo</p>
                  {viewRecord?.data?.["Attached Photo"] ? (
                    <img src={viewRecord.data["Attached Photo"]} alt="Attachment" className="max-w-full rounded-md border" />
                  ) : (
                    <p className="text-sm text-zinc-400 italic">No photo attached</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewRecord(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editRecord} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>Modify the submitted form details.</DialogDescription>
          </DialogHeader>
          
          {editRecord && template && (
            <div className="flex-1 overflow-y-auto">
              <EditRecordForm 
                template={template} 
                record={editRecord} 
                isPending={updateMutation.isPending}
                onCancel={() => setEditRecord(null)}
                onSave={(payload: any) => {
                  updateMutation.mutate({ id: editRecord._id, payload: { data: payload } });
                }} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteRecordId} onOpenChange={(open) => !open && setDeleteRecordId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteRecordId(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteRecordId && deleteMutation.mutate(deleteRecordId)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </section>
  );
}
