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
  ChevronDown,
  Tag,
  Type,
  AlignLeft,
  ListFilter,
  Radio as RadioIcon,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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

const FIELD_TYPES: {
  value: TemplateFieldType;
  label: string;
  description: string;
  needsOptions: boolean;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    value: "text",
    label: "Text input",
    description: "Single-line field for short text answers (e.g. Name, Phone, ID)",
    needsOptions: false,
    icon: Type,
  },
  {
    value: "textarea",
    label: "Text area",
    description: "Multi-line field for longer notes, remarks, or descriptions",
    needsOptions: false,
    icon: AlignLeft,
  },
  {
    value: "dropdown",
    label: "Dropdown",
    description: "Dropdown menu where employees select one choice from a list",
    needsOptions: true,
    icon: ListFilter,
  },
  {
    value: "radio",
    label: "Radio buttons",
    description: "Radio button list where employees pick one visible choice",
    needsOptions: true,
    icon: RadioIcon,
  },
  {
    value: "multiselect",
    label: "Multi select",
    description: "Checkboxes allowing employees to pick multiple choices",
    needsOptions: true,
    icon: CheckSquare,
  },
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
  cameraOpen,
  onCameraOpenChange,
  onImageChange,
  videoRef,
  height,
  onHeightChange,
  isResizing,
  onSaveResize,
}: {
  cameraOpen: boolean;
  onCameraOpenChange: (open: boolean) => void;
  onImageChange: (src: string | null) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  height: number;
  onHeightChange: (h: number) => void;
  isResizing?: boolean;
  onSaveResize?: () => void;
}) {
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    onCameraOpenChange(false);
  }

  // async function startCamera() {
  //   setError(null);
  //   stopCamera();
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: "environment" },
  //       audio: false,
  //     });
  //     streamRef.current = stream;
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       await videoRef.current.play();
  //     }
  //     onCameraOpenChange(true);
  //   } catch {
  //     setError("Camera access was denied or isn't available on this device.");
  //   }
  // }

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
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
      <div className="flex items-center justify-between mb-1">
        <Label className="text-sm font-semibold text-foreground">Profile / upload image</Label>
        {isResizing && onSaveResize && (
          <Button type="button" size="sm" onClick={onSaveResize}>
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save
          </Button>
        )}
      </div>
      <p className="mb-2 mt-0.5 text-xs text-muted-foreground">
        Always available — capture from a webcam or phone camera (front or back). Drag the handle below to set camera height.
      </p>

      <div
        style={{ height }}
        className="relative mt-2 w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30"
      >
        <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
          {!cameraOpen ? (
            <>
              <Camera className="h-8 w-8" />
              <p className="text-xs">Camera area (resize to set height)</p>
            </>
          ) : (
            <p className="text-xs">Camera is live in preview section</p>
          )}
        </div>
        {isResizing && (
          <div
            onPointerDown={onDragStart}
            className="absolute bottom-0 left-1/2 flex h-5 w-16 -translate-x-1/2 cursor-ns-resize items-center justify-center rounded-t-md border border-b-0 border-border bg-card/90"
            title="Drag to resize"
          >
            <GripHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live, read-only preview of a single custom field (used in the form preview)
// ---------------------------------------------------------------------------

function FieldPreview({ field }: { field: TemplateField }) {
  const options = Array.isArray(field.options) ? field.options : [];
  return (
    <div>
      <Label className="text-sm font-medium text-foreground">
        {field.label || "Untitled field"}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      <div className="mt-1.5">
        {field.type === "text" && <Input placeholder="User input" />}
        {field.type === "textarea" && <Textarea placeholder="User input" rows={3} />}
        {field.type === "dropdown" && (
          <div className="flex flex-col gap-1.5">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
              defaultValue=""
            >
              <option value="">Select an option</option>
              {options.map((opt, i) => (
                <option key={i} value={opt} className="bg-popover text-popover-foreground">
                  {opt}
                </option>
              ))}
            </select>
            {options.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {options.map((opt, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {field.type === "radio" && (
          <div className="flex flex-col gap-1.5">
            {(options.length ? options : ["Option"]).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                <input type="radio" name={`preview_radio_${field.id}`} className="h-3.5 w-3.5 accent-primary" /> {opt}
              </label>
            ))}
          </div>
        )}
        {field.type === "multiselect" && (
          <div className="flex flex-col gap-1.5">
            {(options.length ? options : ["Option"]).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                <input type="checkbox" className="h-3.5 w-3.5 accent-primary" /> {opt}
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

const DRAFT_KEY_NEW = "dynamic_record_new_template_draft";
const getDraftKey = (id?: string) => (id ? `dynamic_record_template_draft_${id}` : DRAFT_KEY_NEW);

export default function TemplateBuilderPage({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Template meta
  const [templateName, setTemplateName] = useState("Untitled template");
  const [status, setStatus] = useState<TemplateStatus>("active");

  // Image field config
  const [imageHeight, setImageHeight] = useState(220);
  const [image, setImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  // Access control
  const [accessUsers, setAccessUsers] = useState<TemplateAccess[]>([]);
  const [accessName, setAccessName] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [allowCameraUploads, setAllowCameraUploads] = useState(false);

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
  const [showResizeModal, setShowResizeModal] = useState(false);
  const [isResizingImage, setIsResizingImage] = useState(false);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isHydratedRef = useRef(false);

  const selectedTypeConfig = FIELD_TYPES.find((t) => t.value === draft.type) || FIELD_TYPES[0];

  useEffect(() => {
    if (templateId) {
      setIsFetching(true);
      templatesApi.getTemplateById(templateId).then((data: any) => {
        if (data) {
          // Check draft in localStorage for any unsaved labels/changes
          let draftData: any = null;
          try {
            const rawDraft = localStorage.getItem(getDraftKey(templateId));
            if (rawDraft) draftData = JSON.parse(rawDraft);
          } catch (e) {
            console.error("Failed to parse template draft", e);
          }

          const rawFields = draftData?.fields || data.fields || [];
          const normalizedFields: TemplateField[] = rawFields.map((f: any) => ({
            id: f.id || f._id?.toString() || uid(),
            label: f.label || "",
            type: (f.type as TemplateFieldType) || "text",
            required: Boolean(f.required),
            options: Array.isArray(f.options) ? f.options : [],
          }));

          setTemplateName(draftData?.name ?? data.name ?? "Untitled template");
          setStatus((draftData?.status as TemplateStatus) ?? (data.status as TemplateStatus) ?? "active");
          setImage(draftData?.image ?? data.image ?? null);
          setImageHeight(draftData?.imageHeight ?? data.imageHeight ?? 220);
          setAllowCameraUploads(draftData?.cameraAccess ?? data.cameraAccess ?? false);
          setAccessUsers(
            draftData?.access ??
              (data.access || []).map((u: any) => ({
                id: u.id || u._id?.toString() || uid(),
                name: u.name || "",
                email: u.email || "",
              }))
          );
          setFields(normalizedFields);
        }
      }).catch(err => {
         console.error("Failed to load template", err);
      }).finally(() => {
         setIsFetching(false);
         isHydratedRef.current = true;
      });
    } else {
      // New template mode: restore draft from localStorage if user added labels before refresh
      try {
        const rawDraft = localStorage.getItem(DRAFT_KEY_NEW);
        if (rawDraft) {
          const draftData = JSON.parse(rawDraft);
          if (draftData) {
            if (draftData.name !== undefined) setTemplateName(draftData.name);
            if (draftData.status) setStatus(draftData.status);
            if (draftData.image !== undefined) setImage(draftData.image);
            if (draftData.imageHeight) setImageHeight(draftData.imageHeight);
            if (draftData.cameraAccess !== undefined) setAllowCameraUploads(draftData.cameraAccess);
            if (draftData.access) {
              setAccessUsers(
                draftData.access.map((u: any) => ({
                  id: u.id || u._id?.toString() || uid(),
                  name: u.name || "",
                  email: u.email || "",
                }))
              );
            }
            if (Array.isArray(draftData.fields)) {
              setFields(
                draftData.fields.map((f: any) => ({
                  id: f.id || f._id?.toString() || uid(),
                  label: f.label || "",
                  type: (f.type as TemplateFieldType) || "text",
                  required: Boolean(f.required),
                  options: Array.isArray(f.options) ? f.options : [],
                }))
              );
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore new template draft", e);
      }
      isHydratedRef.current = true;
    }
  }, [templateId]);

  // Persist template builder draft to localStorage so labels are never lost on refresh
  useEffect(() => {
    if (!isHydratedRef.current || isFetching) return;
    try {
      const draftKey = getDraftKey(templateId);
      const draftPayload = {
        name: templateName,
        status,
        image,
        imageHeight,
        cameraAccess: allowCameraUploads,
        access: accessUsers,
        fields,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftPayload));
    } catch (e) {
      console.error("Failed to save draft to localStorage", e);
    }
  }, [templateId, templateName, status, image, imageHeight, allowCameraUploads, accessUsers, fields, isFetching]);

  function openAddField() {
    setEditingFieldId(null);
    setDraft({ label: "", type: "text", optionsText: "", required: false });
    setFieldDialogOpen(true);
  }

  function openEditField(field: TemplateField) {
    setEditingFieldId(field.id);
    const options = Array.isArray(field.options) ? field.options : [];
    setDraft({
      label: field.label || "",
      type: (field.type as TemplateFieldType) || "text",
      optionsText: options.join(", "),
      required: Boolean(field.required),
    });
    setFieldDialogOpen(true);
  }

  async function saveField() {
    if (!draft.label.trim()) return;
    const options = draft.optionsText
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    let updatedFields: TemplateField[];
    if (editingFieldId) {
      updatedFields = fields.map((f) =>
        f.id === editingFieldId
          ? { ...f, label: draft.label.trim(), type: draft.type, options, required: draft.required }
          : f
      );
    } else {
      updatedFields = [
        ...fields,
        { id: uid(), label: draft.label.trim(), type: draft.type, options, required: draft.required },
      ];
    }
    setFields(updatedFields);
    setFieldDialogOpen(false);

    // Save immediately to localStorage so refresh keeps the added label
    try {
      const draftKey = getDraftKey(templateId);
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          name: templateName,
          status,
          image,
          imageHeight,
          cameraAccess: allowCameraUploads,
          access: accessUsers,
          fields: updatedFields,
        })
      );
    } catch (e) {
      console.error("Failed to save draft on field save", e);
    }

    // If editing an existing template, auto-sync to backend immediately
    if (templateId) {
      try {
        await templatesApi.updateTemplate(templateId, {
          name: templateName,
          status,
          image: image || "",
          imageHeight,
          cameraAccess: allowCameraUploads,
          access: accessUsers,
          fields: updatedFields,
        });
        queryClient.invalidateQueries({ queryKey: ["template", templateId] });
      } catch (err) {
        console.error("Failed to auto-sync field to template", err);
      }
    }
  }

  async function confirmDeleteField() {
    if (!deleteFieldId) return;
    const updatedFields = fields.filter((f) => f.id !== deleteFieldId);
    setFields(updatedFields);
    setDeleteFieldId(null);

    try {
      const draftKey = getDraftKey(templateId);
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          name: templateName,
          status,
          image,
          imageHeight,
          cameraAccess: allowCameraUploads,
          access: accessUsers,
          fields: updatedFields,
        })
      );
    } catch (e) {
      console.error("Failed to save draft on field delete", e);
    }

    if (templateId) {
      try {
        await templatesApi.updateTemplate(templateId, {
          name: templateName,
          status,
          image: image || "",
          imageHeight,
          cameraAccess: allowCameraUploads,
          access: accessUsers,
          fields: updatedFields,
        });
        queryClient.invalidateQueries({ queryKey: ["template", templateId] });
      } catch (err) {
        console.error("Failed to auto-sync field deletion", err);
      }
    }
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
      name: templateName,
      status,
      image: image || "",
      imageHeight,
      cameraAccess: allowCameraUploads,
      access: accessUsers,
      fields,
    };

    setIsSaving(true);
    try {
      let res: any;
      if (templateId) {
        res = await templatesApi.updateTemplate(templateId, payload);
      } else {
        res = await templatesApi.template(payload);
      }
      
      if (res && res.error) {
        throw new Error(res.error);
      }
      setSaveSuccess(true);
      // Clear draft on successful save
      try {
        localStorage.removeItem(getDraftKey(templateId));
      } catch (e) {
        console.error("Failed to clear draft", e);
      }
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      if (templateId) {
        queryClient.invalidateQueries({ queryKey: ["template", templateId] });
      }
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
      <div className="w-full bg-card border border-border text-card-foreground rounded-lg p-4 shadow-xs">
        {isFetching && (
          <div className="absolute inset-0 bg-background/50 z-50 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {/* Top action bar --------------------------------------------------- */}
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} title="Back" className="self-end mb-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="template-name-input" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Template Name</Label>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full border px-2 py-0 text-[10px]",
                    status === "active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Input
                id="template-name-input"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name..."
                className="h-10 px-3 text-lg font-bold shadow-xs w-full min-w-[300px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-end">
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

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 max-h-[calc(100vh-225px)] overflow-y-auto">
          {/* Left / main column --------------------------------------------- */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <ImageCaptureField
              cameraOpen={cameraOpen}
              onCameraOpenChange={setCameraOpen}
              onImageChange={setImage}
              videoRef={videoRef}
              height={imageHeight}
              onHeightChange={setImageHeight}
              isResizing={isResizingImage}
              onSaveResize={() => {
                setIsResizingImage(false);
                setAllowCameraUploads(true);
              }}
            />

            {/* Custom field builder */}
            <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Form fields</h3>
                  <p className="text-xs text-muted-foreground">
                    Add your own labels and pick the input type each one needs.
                  </p>
                </div>
                <Button size="sm" onClick={openAddField} className="shadow-xs cursor-pointer">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add label
                </Button>
              </div>

              {fields.length === 0 ? (
                <div className="flex min-h-[140px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border bg-muted/20 text-center">
                  <p className="text-sm text-foreground">No fields yet</p>
                  <p className="text-xs text-muted-foreground">Click &quot;Add label&quot; to build your form.</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {fields.map((field) => (
                    <li key={field.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="ml-1 text-destructive">*</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {FIELD_TYPES.find((t) => t.value === field.type)?.label}
                          {(field.options || []).length > 0 && ` · ${field.options.join(", ")}`}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="icon" title="Edit" onClick={() => openEditField(field)}>
                          <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete"
                          onClick={() => setDeleteFieldId(field.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right column: live preview + access control + camera settings --------------------- */}
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Enable Camera / Photo Upload</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Allow users to attach a photo when submitting a record</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={allowCameraUploads}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setShowResizeModal(true);
                      } else {
                        setAllowCameraUploads(false);
                      }
                    }}
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Live preview</h3>
              <div className="flex flex-col gap-3">
                {cameraOpen && (
                  <video
                    ref={videoRef}
                    style={{ height: imageHeight }}
                    className="w-full rounded-md object-cover"
                    playsInline
                    muted
                  />
                )}
                {image && (
                  <img
                    src={image}
                    alt="Template preview"
                    style={{ height: imageHeight }}
                    className="w-full rounded-md object-cover"
                  />
                )}
                {fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Fields you add will appear here.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {fields.map((field) => (
                      <FieldPreview key={field.id} field={field} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Assign Employees (Grant Access)</h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Grant specific employees access to use this template. As an admin, you can edit all features.
              </p>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <UserIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Full name"
                    value={accessName}
                    onChange={(e) => setAccessName(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
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
        <DialogContent className="w-[94vw] max-w-lg p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <Tag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                  {editingFieldId ? "Edit Form Label" : "Add Form Label"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Configure the label name, input type, and options for this field.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 space-y-4 bg-card overflow-y-auto max-h-[calc(85vh-130px)]">
            {/* Label input */}
            <div className="space-y-1.5">
              <Label htmlFor="field-label" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
                Label Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="field-label"
                placeholder="e.g. Employee ID, Department, Contact Number"
                value={draft.label}
                onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                className="h-10 text-sm bg-background border-border"
              />
              <p className="text-[11px] text-muted-foreground">The title displayed above the input field on the submission form.</p>
            </div>

            {/* Field type dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="field-type" className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1">
                Field Type
              </Label>
              <div className="relative">
                <select
                  id="field-type"
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, type: e.target.value as TemplateFieldType }))
                  }
                  className="
                    h-10 w-full appearance-none rounded-lg border border-border
                    bg-background text-foreground pl-3.5 pr-10 text-sm font-medium shadow-2xs
                    hover:border-foreground/30 hover:bg-muted/30
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus:border-primary
                    cursor-pointer transition-colors
                  "
                >
                  {FIELD_TYPES.map((t) => (
                    <option
                      key={t.value}
                      value={t.value}
                      className="bg-card text-card-foreground dark:bg-zinc-900 dark:text-zinc-100 py-2.5 font-medium"
                    >
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              {/* Dynamic Field Type Helper Card */}
              {selectedTypeConfig && (
                <div className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-muted/40 border border-border/70 text-xs text-muted-foreground">
                  {(() => {
                    const IconComp = selectedTypeConfig.icon;
                    return <IconComp className="h-4 w-4 text-primary shrink-0 mt-0.5" />;
                  })()}
                  <span className="leading-snug">{selectedTypeConfig.description}</span>
                </div>
              )}
            </div>

            {/* Options list for dropdown, radio, multiselect */}
            {selectedTypeConfig.needsOptions && (
              <div className="space-y-2 p-3.5 rounded-lg border border-border bg-muted/20">
                <div className="space-y-1">
                  <Label htmlFor="field-options" className="text-xs sm:text-sm font-semibold text-foreground flex items-center justify-between">
                    <span>Options List</span>
                    <span className="text-[11px] font-normal text-muted-foreground">Comma separated</span>
                  </Label>
                  <Textarea
                    id="field-options"
                    placeholder="e.g. Option 1, Option 2, Option 3"
                    value={draft.optionsText}
                    onChange={(e) => setDraft((d) => ({ ...d, optionsText: e.target.value }))}
                    rows={2}
                    className="text-sm bg-background border-border resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Separate choices with a comma. Each choice will be presented as an option.
                  </p>
                </div>

                {/* Live options preview badges */}
                {draft.optionsText.trim() && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">Choices Preview:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {draft.optionsText
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .map((opt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-background border border-border text-foreground shadow-2xs"
                          >
                            {opt}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Required field toggle card */}
            <label
              htmlFor="field-required-toggle"
              className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-background/60 hover:bg-muted/40 cursor-pointer transition-colors shadow-2xs select-none"
            >
              <input
                id="field-required-toggle"
                type="checkbox"
                checked={draft.required}
                onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground">Required Label</span>
                <span className="text-xs text-muted-foreground">
                  Employees must provide a value for this field before submitting the record.
                </span>
              </div>
            </label>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20 shrink-0 flex items-center justify-end gap-2.5">
            <Button variant="outline" onClick={() => setFieldDialogOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={saveField}
              disabled={!draft.label.trim()}
              className="cursor-pointer shadow-xs"
            >
              {editingFieldId ? (
                <>
                  <Save className="mr-1.5 h-4 w-4" /> Save changes
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 h-4 w-4" /> Add label
                </>
              )}
            </Button>
          </div>
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
              onClick={async () => {
                try {
                  localStorage.removeItem(getDraftKey(templateId));
                } catch (e) {
                  console.error("Failed to clear draft", e);
                }
                if (templateId) {
                  try {
                    await templatesApi.deleteTemplate(templateId);
                    toast.success("Template deleted successfully");
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                    router.push('/admin/templates');
                    router.refresh();
                  } catch (err: any) {
                    toast.error(err.message || "Failed to delete template");
                  }
                } else {
                  router.back();
                }
                setShowDeleteTemplate(false);
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
              onClick={async () => {
                if (templateId) {
                  try {
                    const newStatus = status === "active" ? "inactive" : "active";
                    await templatesApi.toggleTemplateStatus({ id: templateId, status: newStatus });
                    toast.success("Template status updated");
                    queryClient.invalidateQueries({ queryKey: ["templates"] });
                    setStatus(newStatus);
                  } catch (err: any) {
                    toast.error(err.message || "Failed to update status");
                  }
                } else {
                  setStatus((s) => (s === "active" ? "inactive" : "active"));
                }
                setShowStatusConfirm(false);
              }}
            >
              {status === "active" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Resize prompt modal -------------------------------------- */}
      <AlertDialog open={showResizeModal} onOpenChange={setShowResizeModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you resize the Profile / upload image camera section</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsResizingImage(false);
              setAllowCameraUploads(true);
              setShowResizeModal(false);
            }}>No resize</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsResizingImage(true);
              setShowResizeModal(false);
            }}>Yes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}