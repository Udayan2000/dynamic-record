"use client";
import { useQuery } from "@tanstack/react-query";
import { templatesApi } from "@/services/templatebuilder-services";
import { Badge } from "@/components/ui/badge";
import { FileStack, ArrowLeft, Users, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function TemplateView({ templateId }: { templateId: string }) {
    const router = useRouter();

    const { data: template, isLoading, isError } = useQuery({
        queryKey: ["template", templateId],
        queryFn: () => templatesApi.getTemplateById(templateId),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px] text-zinc-500">
                Loading template details...
            </div>
        );
    }

    if (isError || !template) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 gap-2">
                <FileStack className="h-8 w-8 text-zinc-300" />
                <p className="font-medium text-zinc-500">Template not found</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Templates
            </Button>

            <div className="w-full rounded-lg border border-border bg-card text-card-foreground overflow-hidden shadow-xs">
                <div 
                    className="w-full relative flex items-center justify-center bg-muted/40" 
                    style={{ height: `${template.imageHeight || 220}px` }}
                >
                    {template.image ? (
                        <img 
                            src={template.image} 
                            alt={template.name} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileStack className="h-12 w-12" />
                            <p className="text-sm">No banner image</p>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">{template.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant={template.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                    {template.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Created {new Date(template.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground">Authorized Access</h3>
                        </div>
                        {template.access && template.access.length > 0 ? (
                            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                                {template.access.map(user => (
                                    <div key={user.id} className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                                        <span className="text-sm font-medium text-foreground">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No employees have been granted access.</p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="rounded-lg border border-border bg-card text-card-foreground p-4 shadow-xs min-h-[300px]">
                        <div className="flex items-center gap-2 mb-6">
                            <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold text-foreground">Form Fields Preview</h3>
                        </div>

                        {template.fields && template.fields.length > 0 ? (
                            <div className="flex flex-col gap-6 max-w-xl">
                                {template.fields.map(field => (
                                    <div key={field.id}>
                                        <Label className="text-sm font-medium text-foreground mb-2 block">
                                            {field.label}
                                            {field.required && <span className="text-destructive ml-1">*</span>}
                                        </Label>
                                        
                                        {field.type === "text" && <Input placeholder="Text input" />}
                                        {field.type === "textarea" && <Textarea placeholder="Long text input" rows={3} />}
                                        {field.type === "dropdown" && (
                                            <select className="h-10 w-full rounded-md border-[0.5px] border-input bg-background px-3 text-sm text-foreground shadow-xs focus:ring-[0.5px] focus:ring-ring focus:outline-none focus-visible:outline-none focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:border-[0.5px] cursor-pointer">
                                                <option>{field.options[0] || "Select an option"}</option>
                                            </select>
                                        )}
                                        {field.type === "radio" && (
                                            <div className="flex flex-col gap-2 mt-1">
                                                {(field.options || []).map((opt, i) => (
                                                    <label key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <input type="radio" name={`radio_${field.id}`} className="h-4 w-4 border-input text-primary focus:ring-primary" /> {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {field.type === "multiselect" && (
                                            <div className="flex flex-col gap-2 mt-1">
                                                {(field.options || []).map((opt, i) => (
                                                    <label key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <input type="checkbox" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" /> {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                <p>No custom fields defined for this template.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
