"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alertdialog";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Camera,
  CheckCircle2,
  GripHorizontal,
  Loader2,
  Mail,
  Pencil,
  Plus,
  Power,
  RotateCw,
  Save,
  Trash2,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { templatesApi } from "@/services/auth-services"; 
import {
  CreateTemplatePayload,
  TemplateAccess,
  TemplateField,
  TemplateFieldType,
  TemplateStatus,
} from "@/types";
import { templatesApi } from "@/services/templatebuilder-services";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIELD_TYPES: { value: TemplateFieldType; label: string; needsOptions: boolean }[] = [
  { value: "text", label: "Text input", needsOptions: false },
  { value: "textarea", label: "Text area", needsOptions: false },
  { value: "dropdown", label: "Dropdown", needsOptions: true },
  { value: "radio", label: "Radio buttons", needsOptions: true },
  { value: "multiselect", label: "Multi select", needsOptions: true },
];

const MIN_IMAGE_HEIGHT = 140;
const MAX_IMAGE_HEIGHT = 560;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Image field — camera (webcam / phone, front + back), file upload,
// rotate / delete, and a drag handle to resize the preview height.
// ---------------------------------------------------------------------------

function ImageCaptureField({
  height,
  onHeightChange,
  image,
  onImageChange,
}: {
  height: number;
  onHeightChange: (h: number) => void;
  image: string | null;
  onImageChange: (src: string | null) => void;
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

  function onDragStart(e: React.PointerEvent) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    function onMove(ev: PointerEvent) {
      const next = Math.min(
        MAX_IMAGE_HEIGHT,
        Math.max(MIN_IMAGE_HEIGHT, startHeight + (ev.clientY - startY))
      );
      onHeightChange(next);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="rounded-sm border border-[#f1f5fe] bg-white p-3">
      <Label className="text-sm font-semibold text-zinc-800">Profile / upload image</Label>
      <p className="mb-2 mt-0.5 text-xs text-zinc-400">
        Always available — capture from a webcam or phone camera (front or back), or upload a
        file from your computer or phone. Drag the handle below to resize the preview.
      </p>

      <div
        style={{ height }}
        className="relative w-full overflow-hidden rounded-md border border-dashed border-[#c7d7fe] bg-[#fafbff]"
      >
        {cameraOpen ? (
          <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
        ) : image ? (
          <img src={image} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-400">
            <Camera className="h-8 w-8" />
            <p className="text-xs">No image yet</p>
          </div>
        )}

        <div
          onPointerDown={onDragStart}
          className="absolute bottom-0 left-1/2 flex h-5 w-16 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md border border-b-0 border-[#c7d7fe] bg-white/90"
          title="Drag to resize"
        >
          <GripHorizontal className="h-3.5 w-3.5 text-zinc-400" />
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}

      <div className="mt-2.5 flex flex-wrap gap-2">
        {!cameraOpen ? (
          <Button type="button" variant="outline" size="sm" onClick={() => startCamera()}>
            <Camera className="mr-1.5 h-3.5 w-3.5" /> Use camera
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={capturePhoto}>
              Capture
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={flipCamera}>
              <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Flip camera
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>
              Cancel
            </Button>
          </>
        )}

        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

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
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live, read-only preview of a single custom field (used in the form preview)
// ---------------------------------------------------------------------------

function FieldPreview({ field }: { field: TemplateField }) {
  return (
    <div>
      <Label className="text-sm text-zinc-700">
        {field.label || "Untitled field"}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </Label>
      <div className="mt-1.5">
        {field.type === "text" && <Input placeholder="User input" />}
        {field.type === "textarea" && <Textarea placeholder="User input" rows={3} />}
        {field.type === "dropdown" && (
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-zinc-800"
          >
            <option>{field.options[0] || "Choose an option"}</option>
          </select>
        )}
        {field.type === "radio" && (
          <div className="flex flex-col gap-1.5">
            {(field.options.length ? field.options : ["Option"]).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="radio" name={`preview_radio_${field.id}`} className="h-3.5 w-3.5" /> {opt}
              </label>
            ))}
          </div>
        )}
        {field.type === "multiselect" && (
          <div className="flex flex-col gap-1.5">
            {(field.options.length ? field.options : ["Option"]).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" className="h-3.5 w-3.5" /> {opt}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TemplateBuilderPage() {
  const router = useRouter();

  // Template meta
  const [templateName, setTemplateName] = useState("Untitled template");
  const [status, setStatus] = useState<TemplateStatus>("active");

  // Image field config
  const [imageHeight, setImageHeight] = useState(220);
  const [image, setImage] = useState<string | null>(null);

  // Access control
  const [accessUsers, setAccessUsers] = useState<TemplateAccess[]>([]);
  const [accessName, setAccessName] = useState("");
  const [accessEmail, setAccessEmail] = useState("");

  // Custom fields
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    label: "",
    type: "text" as TemplateFieldType,
    optionsText: "",
    required: false,
  });

  const [deleteFieldId, setDeleteFieldId] = useState<string | null>(null);
  const [showDeleteTemplate, setShowDeleteTemplate] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedTypeConfig = FIELD_TYPES.find((t) => t.value === draft.type)!;

  function openAddField() {
    setEditingFieldId(null);
    setDraft({ label: "", type: "text", optionsText: "", required: false });
    setFieldDialogOpen(true);
  }

  function openEditField(field: TemplateField) {
    setEditingFieldId(field.id);
    setDraft({
      label: field.label,
      type: field.type as TemplateFieldType,
      optionsText: field.options.join(", "),
      required: field.required,
    });
    setFieldDialogOpen(true);
  }

  function saveField() {
    if (!draft.label.trim()) return;
    const options = draft.optionsText
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    if (editingFieldId) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingFieldId
            ? { ...f, label: draft.label, type: draft.type, options, required: draft.required }
            : f
        )
      );
    } else {
      setFields((prev) => [
        ...prev,
        { id: uid(), label: draft.label, type: draft.type, options, required: draft.required },
      ]);
    }
    setFieldDialogOpen(false);
  }

  function confirmDeleteField() {
    if (!deleteFieldId) return;
    setFields((prev) => prev.filter((f) => f.id !== deleteFieldId));
    setDeleteFieldId(null);
  }

  function addAccessUser() {
    if (!accessName.trim() || !accessEmail.trim()) return;
    setAccessUsers((prev) => [
      ...prev,
      { id: uid(), name: accessName.trim(), email: accessEmail.trim() },
    ]);
    setAccessName("");
    setAccessEmail("");
  }

  function removeAccessUser(id: string) {
    setAccessUsers((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleSaveTemplate() {
    setSaveError(null);
    setSaveSuccess(false);

    if (!templateName.trim()) {
      setSaveError("Give the template a name before saving.");
      return;
    }

    const payload: CreateTemplatePayload = {
      name: templateName.trim(),
      status,
      image: image || "",
      imageHeight,
      access: accessUsers,
      fields,
    };

    setIsSaving(true);
    try {
      const res = await templatesApi.template(payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to save template");
      }
      setSaveSuccess(true);
      router.refresh();
      // brief pause so the success state is visible before navigating away
      setTimeout(() => router.push('/admin/templates'), 500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong while saving.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <div className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm px-2 pt-2 pb-2">
        {/* Top action bar --------------------------------------------------- */}
        <div className="mb-3 flex flex-col gap-3 rounded-sm border border-[#f1f5fe] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <Input
                id="template-name-input"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="h-8 border-none px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              />
              <Badge
                variant="outline"
                className={cn(
                  "mt-0.5 rounded-full border px-2 py-0 text-[11px]",
                  status === "active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-100 text-zinc-500"
                )}
              >
                {status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("template-name-input")?.focus()}
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowStatusConfirm(true)}>
              {status === "active" ? (
                <Ban className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
              ) : (
                <Power className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              )}
              {status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeleteTemplate(true)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5 text-red-500" /> Delete template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 max-h-[calc(100vh-188px)] overflow-y-auto">
          {/* Left / main column --------------------------------------------- */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <ImageCaptureField
              height={imageHeight}
              onHeightChange={setImageHeight}
              image={image}
              onImageChange={setImage}
            />

            {/* Custom field builder */}
            <div className="rounded-sm border border-[#f1f5fe] bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-800">Form fields</h3>
                  <p className="text-xs text-zinc-400">
                    Add your own labels and pick the input type each one needs.
                  </p>
                </div>
                <Button size="sm" onClick={openAddField}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add label
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#e2e8f9] text-center">
                  <p className="text-sm text-zinc-500">No fields yet</p>
                  <p className="text-xs text-zinc-400">Click "Add label" to build your form.</p>
                </div>
              ) : (
                <ul className="divide-y divide-[#f1f5fe]">
                  {fields.map((field) => (
                    <li key={field.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium text-zinc-800">
                          {field.label}
                          {field.required && <span className="ml-1 text-red-500">*</span>}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                          {field.options.length > 0 && ` · ${field.options.join(", ")}`}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => openEditField(field)}>
                          <Pencil className="h-4 w-4 text-zinc-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => setDeleteFieldId(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right column: live preview + access control --------------------- */}
          <div className="flex flex-col gap-3">
            <div className="rounded-sm border border-[#f1f5fe] bg-white p-3">
              <h3 className="mb-2 text-sm font-semibold text-zinc-800">Live preview</h3>
              <div className="flex flex-col gap-3">
                {image && (
                  <img
                    src={image}
                    alt="Template preview"
                    style={{ height: Math.min(imageHeight, 220) }}
                    className="w-full rounded-md object-cover"
                  />
                )}
                {fields.length === 0 ? (
                  <p className="text-xs text-zinc-400">Fields you add will appear here.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fields.map((field) => (
                      <FieldPreview key={field.id} field={field} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-sm border border-[#f1f5fe] bg-white p-3">
              <h3 className="mb-2 text-sm font-semibold text-zinc-800">Access</h3>
              <p className="mb-2 text-xs text-zinc-400">
                Grant specific people access to use this template.
              </p>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    placeholder="Full name"
                    value={accessName}
                    onChange={(e) => setAccessName(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={accessEmail}
                    onChange={(e) => setAccessEmail(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={addAccessUser}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Grant access
                </Button>
              </div>

              {accessUsers.length > 0 && (
                <ul className="mt-3 divide-y divide-[#f1f5fe]">
                  {accessUsers.map((u) => (
                    <li key={u.id} className="flex items-center justify-between py-2 text-sm">
                      <div>
                        <div className="font-medium text-zinc-800">{u.name}</div>
                        <div className="text-xs text-zinc-400">{u.email}</div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeAccessUser(u.id)}>
                        <X className="h-3.5 w-3.5 text-zinc-400" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {saveError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>Template saved.</span>
              </div>
            )}

            <Button
              className="w-full cursor-pointer"
              onClick={handleSaveTemplate}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" /> Save template
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Add / edit field dialog ------------------------------------------ */}
      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFieldId ? "Edit label" : "Add label"}</DialogTitle>
            <DialogDescription>
              Choose what this label is called and what kind of input it needs.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="field-label">Label</Label>
              <Input
                id="field-label"
                placeholder="e.g. Emergency contact"
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="field-type">Field type</Label>
              <select
                id="field-type"
                value={draft.type}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, type: e.target.value as TemplateFieldType }))
                }
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            {selectedTypeConfig.needsOptions && (
              <div className="grid gap-1.5">
                <Label htmlFor="field-options">Options (comma separated)</Label>
                <Textarea
                  id="field-options"
                  placeholder="e.g. Small, Medium, Large"
                  value={draft.optionsText}
                  onChange={(e) => setDraft((d) => ({ ...d, optionsText: e.target.value }))}
                  rows={2}
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={draft.required}
                onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
                className="h-3.5 w-3.5"
              />
              Required field
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveField} disabled={!draft.label.trim()}>
              {editingFieldId ? "Save changes" : "Add label"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete field confirm ---------------------------------------------- */}
      <AlertDialog open={!!deleteFieldId} onOpenChange={(open) => !open && setDeleteFieldId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this label?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the field and its options from the template. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDeleteField}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete template confirm ------------------------------------------- */}
      <AlertDialog open={showDeleteTemplate} onOpenChange={setShowDeleteTemplate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{templateName}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the template, its fields, and its access list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setShowDeleteTemplate(false);
                router.back();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activate / deactivate confirm -------------------------------------- */}
      <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {status === "active" ? "Deactivate" : "Activate"} this template?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {status === "active"
                ? "Inactive templates can't be used to submit new records until reactivated."
                : "This template will become available for use again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setStatus((s) => (s === "active" ? "inactive" : "active"));
                setShowStatusConfirm(false);
              }}
            >
              {status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}