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
  Trash2,
  User,
  Mail,
  Clock,
  Copy,
  Check,
  FileText,
  Layers,
  Hash,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <div className="space-y-3">
      <Label className="text-xs font-medium text-muted-foreground block">Capture or Upload Photo</Label>

      {(cameraOpen || image) && (
        <div
          className="relative overflow-hidden rounded-[4px] border border-border bg-muted/30 flex items-center justify-center"
          style={{ height: Math.min(height, 220) }}
        >
          {cameraOpen ? (
            <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
          ) : image ? (
            <img src={image} alt="Captured" className="h-full w-full object-contain" />
          ) : null}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-2">
        {!cameraOpen ? (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => startCamera()} className="h-8 text-xs cursor-pointer shadow-xs">
              <Camera className="mr-1.5 h-3.5 w-3.5" /> Use Camera
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 text-xs cursor-pointer shadow-xs">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload Photo
            </Button>
            {image && (
              <>
                <Button type="button" variant="outline" size="sm" onClick={rotateImage} className="h-8 text-xs cursor-pointer shadow-xs">
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Rotate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => onImageChange(null)} className="h-8 text-xs cursor-pointer shadow-xs text-destructive hover:text-destructive">
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Remove
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button type="button" size="sm" onClick={capturePhoto} className="h-8 text-xs cursor-pointer shadow-xs">
              Capture
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={flipCamera} className="h-8 text-xs cursor-pointer shadow-xs">
              <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Flip Camera
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={stopCamera} className="h-8 text-xs cursor-pointer">
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
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id?: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Record ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

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
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/15">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Submitter Details & Attached Photo (4 cols) */}
          <div className="lg:col-span-4 space-y-4">

            {/* Attached Photo Card */}
            {template?.cameraAccess && (
              <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Camera className="h-3.5 w-3.5 text-primary" /> Attached Photo
                  </span>
                  {formData.userImage && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      Attached
                    </Badge>
                  )}
                </div>

                <UserImageCapture
                  image={formData.userImage || null}
                  onImageChange={(img) => handleInputChange("userImage", img)}
                  height={template.imageHeight || 220}
                />
              </div>
            )}
            {/* Submitter Info Card */}
            <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-primary" /> Submitter Details
                </span>
                <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-[4px] border border-border/50">
                  {template?.name || "Template"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                  {record?.submitterName?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{record?.submitterName}</p>
                  <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{record?.submitterEmail}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="rounded-[4px] bg-muted/30 p-2.5 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" /> Date
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1 truncate">
                    {record?.createdAt
                      ? new Date(record.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </p>
                </div>
                <div className="rounded-[4px] bg-muted/30 p-2.5 border border-border/50">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" /> Time
                  </span>
                  <p className="text-xs font-semibold text-foreground mt-1 truncate">
                    {record?.createdAt
                      ? new Date(record.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/70">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Hash className="h-3 w-3" /> Record ID
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(record?._id)}
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                  >
                    {copiedId ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[11px] font-mono text-muted-foreground bg-muted/50 p-2 rounded-[4px] border border-border/40 truncate select-all">
                  {record?._id}
                </div>
              </div>
            </div>

            
          </div>

          {/* Right Column: Form Inputs (8 cols) */}
          <div className="lg:col-span-8">
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b border-border">
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">
                    Edit Form Data
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update response values for {template?.name}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs border-border shrink-0">
                  {template?.fields?.length || 0} fields
                </Badge>
              </div>

              {/* Dynamic Field Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {template.fields.map((field: any) => {
                  const fieldId = field._id || field.id;
                  const isTextarea = field.type === "textarea";

                  return (
                    <div
                      key={fieldId}
                      className={cn(
                        "rounded-lg border border-border/70 bg-card p-3.5 space-y-2 transition-all hover:border-border",
                        isTextarea ? "sm:col-span-2" : "col-span-1"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Label htmlFor={`field-${fieldId}`} className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 truncate cursor-pointer">
                          <span className="truncate">{field.label}</span>
                          {field.required && <span className="text-red-500 font-bold">*</span>}
                        </Label>
                        <span className="text-[10px] font-mono text-muted-foreground/80 uppercase px-1.5 py-0.5 rounded-[4px] bg-muted/60 border border-border/40 shrink-0">
                          {field.type}
                        </span>
                      </div>

                      {field.type === "text" && (
                        <Input
                          id={`field-${fieldId}`}
                          value={formData[fieldId] || ""}
                          onChange={(e) => handleInputChange(fieldId, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          className={errors[fieldId] ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      )}

                      {field.type === "textarea" && (
                        <Textarea
                          id={`field-${fieldId}`}
                          value={formData[fieldId] || ""}
                          onChange={(e) => handleInputChange(fieldId, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          rows={3}
                          className={errors[fieldId] ? "border-red-500 focus-visible:ring-red-500 leading-relaxed" : "leading-relaxed"}
                        />
                      )}

                      {field.type === "dropdown" && (
                        <select
                          id={`field-${fieldId}`}
                          value={formData[fieldId] || ""}
                          onChange={(e) => handleInputChange(fieldId, e.target.value)}
                          className={cn(
                            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                            errors[fieldId] ? "border-red-500" : ""
                          )}
                        >
                          <option value="">Select an option</option>
                          {field.options.map((opt: string, i: number) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "radio" && (
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {field.options.map((opt: string, i: number) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-foreground cursor-pointer bg-muted/30 px-3 py-2 rounded-md border border-border/60 hover:bg-muted/50 transition-colors">
                              <input
                                type="radio"
                                name={fieldId}
                                value={opt}
                                checked={formData[fieldId] === opt}
                                onChange={(e) => handleInputChange(fieldId, e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === "multiselect" && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {field.options.map((opt: string, i: number) => (
                            <label key={i} className="flex items-center gap-2 text-xs text-foreground cursor-pointer bg-muted/30 px-3 py-2 rounded-md border border-border/60 hover:bg-muted/50 transition-colors">
                              <input
                                type="checkbox"
                                value={opt}
                                checked={(formData[fieldId] || []).includes(opt)}
                                onChange={(e) => handleCheckboxChange(fieldId, opt, e.target.checked)}
                                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {errors[fieldId] && (
                        <p className="text-xs text-red-500 mt-1">{errors[fieldId]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground text-center sm:text-left truncate">
          <span>Editing Record ID: </span>
          <span className="font-mono text-foreground font-medium">{record?._id}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="cursor-pointer shadow-xs"
          >
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
  const [selectedImageRecord, setSelectedImageRecord] = useState<any>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Modal States
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const openImageViewer = (imageSrc: string, record?: any) => {
    setSelectedImage(imageSrc);
    setSelectedImageRecord(record || viewRecord || null);
    setImageZoom(1);
    setImageRotation(0);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setSelectedImageRecord(null);
    setImageZoom(1);
    setImageRotation(0);
  };

  const handleEditPhotoFromViewer = () => {
    const targetRecord = selectedImageRecord || viewRecord;
    closeImageViewer();
    if (viewRecord) setViewRecord(null);
    if (targetRecord) {
      setTimeout(() => setEditRecord(targetRecord), 150);
    }
  };

  const handleCopyId = (id?: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success("Record ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getImageName = () => {
    if (!selectedImage) return "photo_attachment.png";
    try {
      if (selectedImage.startsWith("http://") || selectedImage.startsWith("https://") || selectedImage.startsWith("/")) {
        const cleanUrl = selectedImage.split("?")[0].split("#")[0];
        const segments = cleanUrl.split("/");
        const last = segments[segments.length - 1];
        if (last && last.includes(".")) {
          return decodeURIComponent(last);
        }
      }
    } catch {
      // fallback
    }

    const targetRecord = selectedImageRecord || viewRecord;
    if (targetRecord) {
      const submitter = targetRecord.submitterName ? `${targetRecord.submitterName.replace(/\s+/g, "_")}_` : "";
      const recordRef = targetRecord._id ? targetRecord._id.slice(-6) : "photo";
      const ext = selectedImage.includes("image/jpeg") ? ".jpg" : selectedImage.includes("image/webp") ? ".webp" : ".png";
      return `${submitter}Attachment_${recordRef}${ext}`;
    }

    return "photo_attachment.png";
  };

  const handleDownloadPhoto = (photoUrl?: string) => {
    if (!photoUrl) return;
    try {
      const link = document.createElement("a");
      link.href = photoUrl;
      link.download = getImageName();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Photo download initiated");
    } catch {
      toast.error("Failed to download photo");
    }
  };

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
    <section className="w-full  bg-card border border-border rounded-lg p-3 sm:p-4 shadow-xs text-card-foreground">

      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/records')} className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-semibold leading-none tracking-tight text-foreground truncate">{template.name}</h1>
          <p className="text-xs text-muted-foreground mt-1">Viewing {filteredRecords.length} of {totalItems} submissions</p>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex w-full flex-1 min-h-0 flex-col rounded-lg border border-border bg-card mt-3 overflow-hidden shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border p-3 sm:p-4 bg-card">
            <div className="w-full sm:max-w-[360px] md:max-w-[400px]">
              <Input
                type="search"
                placeholder="Search records..."
                isLoading={isSearching}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                onDebouncedChange={(value) => {
                  setDebouncedSearch(value);
                  setPage(1);
                }}
                className="h-10 text-sm bg-background/80"
              />
            </div>
            {user?.role === "admin" && (
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto sm:items-center sm:justify-end">
                <Button
                  onClick={handleExportDrive}
                  disabled={isExporting}
                  variant="default"
                  className="w-full sm:w-auto h-10 sm:h-9 shrink-0 text-white shadow-xs justify-center font-medium active:scale-[0.98] transition-all touch-manipulation"
                >
                  {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudDownload className="mr-2 h-4 w-4" />}
                  <span>Drive Export</span>
                </Button>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full sm:w-auto h-10 sm:h-9 shrink-0 shadow-xs justify-center font-medium active:scale-[0.98] transition-all touch-manipulation"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span>CSV</span>
                </Button>
              </div>
            )}
          </div>

          <div className="w-full">
            <div className="h-[calc(100vh-306px)] overflow-y-auto overflow-x-auto w-full relative table-scrollbar">
              <table className="w-full text-left text-sm text-foreground whitespace-nowrap min-w-[850px] border-collapse">
                <thead className="sticky top-0 z-20 bg-muted border-b border-border shadow-xs">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0">Submitted By</th>
                    {template.cameraAccess && (
                      <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-center">Photo</th>
                    )}
                    <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0">Date</th>
                    
                    {template.fields.map((f) => (
                      <th key={f.id} scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 max-w-[200px] truncate" title={f.label}>
                        {f.label}
                      </th>
                    ))}
                    
                    <th scope="col" className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={template.fields.length + 4} className="px-5 py-8 text-center text-muted-foreground">
                        No records match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record: any) => (
                      <tr key={record._id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{record.submitterName}</span>
                            <span className="text-xs text-muted-foreground">{record.submitterEmail}</span>
                          </div>
                        </td>

                        {template.cameraAccess && (
                          <td className="px-5 py-3.5 text-center">
                            {record.data?.["Attached Photo"] ? (
                              <button
                                onClick={() => openImageViewer(record.data["Attached Photo"], record)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-border bg-card hover:bg-muted transition-colors shadow-xs overflow-hidden cursor-pointer"
                                title="View Photo"
                              >
                                <img src={record.data["Attached Photo"]} className="h-full w-full object-cover" alt="Record attachment" />
                              </button>
                            ) : (
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-[4px] border border-dashed border-border bg-muted/30 text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(record.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        {template.fields.map((f) => {
                          const val = record.data?.[f.label];
                          return (
                            <td key={f.id} className="px-5 py-3.5 max-w-[200px] truncate text-foreground" title={Array.isArray(val) ? val.join(", ") : val}>
                              {Array.isArray(val) ? (
                                val.length > 0 ? (
                                  <span>{val.join(", ")}</span>
                                ) : (
                                  <span className="text-muted-foreground italic">-</span>
                                )
                              ) : (
                                val ? <span>{val}</span> : <span className="text-muted-foreground italic">-</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-5 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setTimeout(() => setViewRecord(record), 0)}>
                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setEditRecord(record), 0)}>
                                <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Record
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setTimeout(() => setDeleteRecordId(record._id), 0)} className="text-destructive focus:text-destructive">
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

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-3 sm:px-4 py-3 border-t border-border bg-card">
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
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && closeImageViewer()}>
        <DialogContent className="w-[98vw] max-w-7xl h-[92vh] max-h-[94vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 shrink-0 pr-12">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Camera className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                    Photo Preview
                  </DialogTitle>
                  {template?.name && (
                    <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-normal border-border">
                      {template.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                  {selectedImageRecord?.submitterName ? (
                    <>
                      <span>Submitted by {selectedImageRecord.submitterName}</span>
                      <span>•</span>
                      <span>
                        {selectedImageRecord.createdAt
                          ? new Date(selectedImageRecord.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Record Attachment"}
                      </span>
                    </>
                  ) : (
                    <span>Record Attachment Photo Viewer</span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Large Scale Image Viewport */}
          <div className="relative flex-1 w-full bg-zinc-950 dark:bg-black/95 overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-60" />

            {selectedImage ? (
              <div
                className="relative flex items-center justify-center w-full h-full overflow-hidden transition-transform duration-150 ease-out"
                style={{
                  transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
                }}
              >
                <img
                  src={selectedImage}
                  alt="Record photo preview"
                  className="w-full h-full object-contain rounded-md shadow-2xl pointer-events-auto"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-zinc-400 gap-2">
                <ImageIcon className="h-10 w-10 stroke-1" />
                <p className="text-sm">No image available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Portion: Balanced empty spacer (Record ID removed) */}
            <div className="hidden sm:block sm:w-48" />

            {/* Middle Portion: Widget Features (Zoom, Rotate, Reset, Download) */}
            {selectedImage && (
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 ">
                {/* Zoom Controls Segment */}
                <div className="flex items-center bg-muted/70 rounded-sm p-0.5 border border-border/60">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground hover:bg-background hover:text-primary rounded-md cursor-pointer transition-colors shadow-2xs"
                    onClick={() => setImageZoom((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))))}
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <div className="px-2 min-w-[50px] text-center select-none">
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {Math.round(imageZoom * 100)}%
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-foreground hover:bg-background hover:text-primary rounded-md cursor-pointer transition-colors shadow-2xs"
                    onClick={() => setImageZoom((prev) => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="h-5 w-[1px] bg-border/80" />

                {/* Rotation & Fit Controls Segment */}
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground border-border/80 shadow-2xs cursor-pointer gap-1.5"
                    onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                    title="Rotate 90 degrees clockwise"
                  >
                    <RotateCw className="h-3.5 w-3.5 text-primary" />
                    <span className="hidden sm:inline">Rotate</span>
                    <span className="text-[10px] text-muted-foreground font-mono">90°</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground border-border/80 shadow-2xs cursor-pointer gap-1.5"
                    onClick={() => {
                      setImageZoom(1);
                      setImageRotation(0);
                    }}
                    title="Reset zoom & rotation to default"
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Fit View</span>
                  </Button>
                </div>

                <div className="h-5 w-[1px] bg-border/80" />

                {/* Download Action */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs font-medium bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary border-primary/20 shadow-2xs cursor-pointer gap-1.5 transition-colors"
                  onClick={() => handleDownloadPhoto(selectedImage)}
                  title="Download high-resolution image"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            )}

            {/* Right Portion: Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-48 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={closeImageViewer}
                className="cursor-pointer flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleEditPhotoFromViewer}
                className="cursor-pointer flex-1 sm:flex-initial"
              >
                <Edit className="h-4 w-4 mr-1.5" /> Edit Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Record Dialog */}
      <Dialog open={!!viewRecord} onOpenChange={(open) => !open && setViewRecord(null)}>
        <DialogContent className="w-[96vw] max-w-6xl h-[90vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 shrink-0 pr-12">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                    Record Details
                  </DialogTitle>
                  {template?.name && (
                    <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-normal border-border">
                      {template.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                  <span>Submitted by {viewRecord?.submitterName || "User"}</span>
                  <span>•</span>
                  <span>
                    {viewRecord?.createdAt
                      ? new Date(viewRecord.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/15">
            {viewRecord && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Submitter & Attachment Meta (4 cols) */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Submitter card */}
                  <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-primary" /> Submitter Details
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-[4px] border border-border/50">
                        {template?.name || "Template"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                        {viewRecord.submitterName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{viewRecord.submitterName}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{viewRecord.submitterEmail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="rounded-[4px] bg-muted/30 p-2.5 border border-border/50">
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" /> Date
                        </span>
                        <p className="text-xs font-semibold text-foreground mt-1 truncate">
                          {new Date(viewRecord.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="rounded-[4px] bg-muted/30 p-2.5 border border-border/50">
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" /> Time
                        </span>
                        <p className="text-xs font-semibold text-foreground mt-1 truncate">
                          {new Date(viewRecord.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/70">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Hash className="h-3 w-3" /> Record ID
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyId(viewRecord._id)}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                        >
                          {copiedId ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground bg-muted/50 p-2 rounded-[4px] border border-border/40 truncate select-all">
                        {viewRecord._id}
                      </div>
                    </div>
                  </div>

                  {/* Attached Photo Card */}
                  {(template?.cameraAccess || viewRecord.data?.["Attached Photo"]) && (
                    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-border">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Camera className="h-3.5 w-3.5 text-primary" /> Attached Photo
                        </span>
                        {viewRecord.data?.["Attached Photo"] && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                            Uploaded
                          </Badge>
                        )}
                      </div>

                      {viewRecord.data?.["Attached Photo"] ? (
                        <div className="space-y-3">
                          <div
                            className="relative rounded-[4px] overflow-hidden border border-border bg-muted/40 group cursor-pointer aspect-video flex items-center justify-center max-h-[220px]"
                            onClick={() => openImageViewer(viewRecord.data["Attached Photo"], viewRecord)}
                          >
                            <img
                              src={viewRecord.data["Attached Photo"]}
                              alt="Record Attachment"
                              className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-102"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-white text-xs font-medium flex items-center gap-1.5 bg-black/70 px-3 py-1.5 rounded-[4px] backdrop-blur-xs">
                                <Eye className="h-3.5 w-3.5" /> View Large
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs cursor-pointer shadow-xs"
                              onClick={() => openImageViewer(viewRecord.data["Attached Photo"], viewRecord)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" /> Full Size
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8 text-xs cursor-pointer shadow-xs"
                              onClick={() => handleDownloadPhoto(viewRecord.data["Attached Photo"])}
                            >
                              <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-[4px] text-center bg-muted/10">
                          <ImageIcon className="h-7 w-7 text-muted-foreground/40 mb-1" />
                          <p className="text-xs font-medium text-muted-foreground">No photo attached</p>
                          <p className="text-[11px] text-muted-foreground/60">No image was attached for this record</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column: Form Data (8 cols) */}
                <div className="lg:col-span-8">
                  <div className="rounded-lg border border-border bg-card p-4 sm:p-6 shadow-xs flex flex-col h-full space-y-4">
                    <div className="flex items-center justify-between pb-3.5 border-b border-border">
                      <div>
                        <h3 className="font-semibold text-sm sm:text-base text-foreground">
                          Submitted Form Data
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Detailed values recorded during submission for this template
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs border-border shrink-0">
                        {template?.fields?.length || 0} fields
                      </Badge>
                    </div>

                    {/* Field Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                      {template?.fields.map((field: any) => {
                        const val = viewRecord?.data?.[field.label];
                        const isTextarea = field.type === "textarea";
                        const isArray = Array.isArray(val);

                        return (
                          <div
                            key={field.id || field._id}
                            className={cn(
                              "rounded-lg border border-border/70 bg-card p-3.5 space-y-2 transition-all hover:border-border",
                              isTextarea ? "sm:col-span-2" : "col-span-1"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 truncate">
                                <span className="truncate">{field.label}</span>
                                {field.required && <span className="text-red-500 font-bold">*</span>}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground/80 uppercase px-1.5 py-0.5 rounded-[4px] bg-muted/60 border border-border/40 shrink-0">
                                {field.type}
                              </span>
                            </div>

                            {/* Render value based on type */}
                            {isArray ? (
                              val.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 pt-0.5">
                                  {val.map((item: string, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="px-2.5 py-0.5 text-xs font-normal border border-border"
                                    >
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic bg-muted/20 px-2.5 py-1.5 rounded-[4px] border border-dashed border-border/50">
                                  None selected
                                </div>
                              )
                            ) : isTextarea ? (
                              val ? (
                                <div className="text-xs sm:text-sm text-foreground bg-muted/20 p-3 rounded-[4px] border border-border/40 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
                                  {val}
                                </div>
                              ) : (
                                <div className="text-xs text-muted-foreground italic bg-muted/20 px-2.5 py-2 rounded-[4px] border border-dashed border-border/50">
                                  Empty
                                </div>
                              )
                            ) : (
                              <div
                                className={cn(
                                  "text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-[4px] border break-words",
                                  val
                                    ? "text-foreground bg-muted/30 border-border/50"
                                    : "text-muted-foreground italic bg-muted/10 border-dashed border-border/60"
                                )}
                              >
                                {val || "Not provided"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Additional fields if any in data but not in template fields */}
                    {(() => {
                      const templateLabels = new Set(template?.fields?.map((f: any) => f.label) || []);
                      templateLabels.add("Attached Photo");
                      const extra = Object.entries(viewRecord?.data || {}).filter(
                        ([k]) => !templateLabels.has(k)
                      );
                      if (extra.length === 0) return null;
                      return (
                        <div className="mt-4 pt-4 border-t border-border">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Additional Data
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {extra.map(([key, val]: [string, any]) => (
                              <div key={key} className="rounded-lg border border-border/60 bg-muted/15 p-3 space-y-1">
                                <span className="text-xs font-medium text-muted-foreground">{key}</span>
                                <div className="text-xs sm:text-sm font-medium text-foreground break-words">
                                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3">
           
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewRecord(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={() => {
                  const target = viewRecord;
                  setViewRecord(null);
                  setTimeout(() => setEditRecord(target), 100);
                }}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-1.5" /> Edit Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={!!editRecord} onOpenChange={(open) => !open && setEditRecord(null)}>
        <DialogContent className="w-[96vw] max-w-6xl h-[90vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 shrink-0 pr-12">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Edit className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                    Edit Record
                  </DialogTitle>
                  {template?.name && (
                    <Badge variant="outline" className="hidden sm:inline-flex text-[11px] font-normal border-border">
                      {template.name}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                  <span>Modify submitted data for {editRecord?.submitterName || "User"}</span>
                  <span>•</span>
                  <span>
                    {editRecord?.createdAt
                      ? new Date(editRecord.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </div>
          
          {editRecord && template && (
            <EditRecordForm 
              template={template} 
              record={editRecord} 
              isPending={updateMutation.isPending}
              onCancel={() => setEditRecord(null)}
              onSave={(payload: any) => {
                updateMutation.mutate({ id: editRecord._id, payload: { data: payload } });
              }} 
            />
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
