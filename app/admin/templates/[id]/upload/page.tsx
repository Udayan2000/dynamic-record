"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { templatesApi, recordsApi } from "@/services/templatebuilder-services";
import { Template, TemplateField } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Save, Camera, RotateCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import React from "react";

function UserImageCapture({
  image,
  onImageChange
}: {
  image: string | null;
  onImageChange: (src: string | null) => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<"user" | "environment">("environment");
  const [error, setError] = React.useState<string | null>(null);

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
        video: { facingMode: mode },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
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

  React.useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-3 rounded-md border border-zinc-200 p-4 bg-zinc-50/50">
      <Label className="text-sm font-medium">Capture or Upload Photo</Label>
      
      {(cameraOpen || image) && (
        <div className="relative overflow-hidden rounded-md border bg-zinc-50" style={{ height: 300 }}>
          {cameraOpen ? (
            <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
          ) : image ? (
            <img src={image} alt="Captured" className="h-full w-full object-cover" />
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

export default function TemplateUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setTemplateId(p.id));
  }, [params]);

  const { data: template, isLoading, isError } = useQuery<Template>({
    queryKey: ["template", templateId],
    queryFn: () => templatesApi.getTemplateById(templateId as string),
    enabled: !!templateId,
  });

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (data instanceof FormData) {
        return recordsApi.createRecord(data);
      }
      return recordsApi.createRecord({ templateId: templateId as string, data });
    },
    onSuccess: () => {
      toast.success("Record submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["records"] });
      router.push("/admin/records");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit record");
    },
  });

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
    if (!template) return;

    // Validate
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

    // Convert field IDs to Labels for easier reading in records
    // Alternatively, just save the formData as is, and the UI maps it. 
    // Usually mapping by label is easier to read in DB.
    const submissionData: Record<string, any> = {};
    template.fields.forEach((field: any) => {
      const fieldId = field._id || field.id;
      submissionData[field.label] = formData[fieldId] || (field.type === 'multiselect' ? [] : "");
    });

    let payload: any = submissionData;

    if (template.cameraAccess && formData.userImage) {
      const formPayload = new FormData();
      formPayload.append("templateId", templateId as string);
      formPayload.append("data", JSON.stringify(submissionData));
      
      const dataUrl = formData.userImage;
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      const file = new File([u8arr], "capture.png", { type: mime });
      
      formPayload.append("image", file);
      payload = formPayload;
    }

    mutation.mutate(payload);
  };

  if (!templateId || isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !template) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load template.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-10">
      <div className="mb-4 flex items-center gap-2 mt-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} title="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{template.name}</h1>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        {template.image && template.image !== "CAMERA_ENABLED" && (
          <div 
            className="w-full bg-muted" 
            style={{ height: template.imageHeight || 220 }}
          >
            <img 
              src={template.image} 
              alt={template.name} 
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {template.cameraAccess && (
              <UserImageCapture 
                image={formData.userImage || null} 
                onImageChange={(img) => handleInputChange("userImage", img)} 
              />
            )}
            
            {template.fields.map((field: any) => {
              const fieldId = field._id || field.id;
              return (
              <div key={fieldId} className="space-y-2">
                <Label className="text-sm font-medium">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
                {field.type === "text" && (
                  <Input 
                    value={formData[fieldId] || ""}
                    onChange={(e) => handleInputChange(fieldId, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className={errors[fieldId] ? "border-red-500" : ""}
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
                  <div className="flex flex-col gap-2 mt-2">
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
            )})}

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Submit Record
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
