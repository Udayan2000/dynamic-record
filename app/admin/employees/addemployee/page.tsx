"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
    ArrowLeft, 
    UserPlus, 
    Loader2, 
    User, 
    Mail, 
    MapPin, 
    ShieldCheck, 
    AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee-services";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmployeeStatus = "active" | "inactive";

interface EmployeeFormValues {
    name: string;
    email: string;
    address: string;
    status: EmployeeStatus;
}

interface FormErrors {
    name?: string;
    email?: string;
    address?: string;
}

const INITIAL_VALUES: EmployeeFormValues = {
    name: "",
    email: "",
    address: "",
    status: "active",
};

// ---------------------------------------------------------------------------
// Validation — pure function so it's easy to unit test in isolation
// ---------------------------------------------------------------------------

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: EmployeeFormValues): FormErrors {
    const errors: FormErrors = {};

    if (!values.name.trim()) {
        errors.name = "Employee name is required.";
    } else if (values.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters.";
    }

    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = "Enter a valid email address.";
    }

    if (!values.address.trim()) {
        errors.address = "Address is required.";
    }

    return errors;
}

// ---------------------------------------------------------------------------
// Status segmented control — accessible, theme-aware dual selection
// ---------------------------------------------------------------------------

function StatusToggle({
    value,
    onChange,
}: {
    value: EmployeeStatus;
    onChange: (status: EmployeeStatus) => void;
}) {
    const options: { label: string; value: EmployeeStatus; description: string }[] = [
        { label: "Active", value: "active", description: "Permit system login and record entries" },
        { label: "Inactive", value: "inactive", description: "Temporarily block system access" },
    ];

    return (
        <div
            role="radiogroup"
            aria-label="Employee status"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
            {options.map((opt) => {
                const isSelected = value === opt.value;
                const isActiveOpt = opt.value === "active";
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex items-start gap-3 p-3.5 rounded-lg border text-left cursor-pointer transition-all shadow-2xs select-none",
                            isSelected
                                ? isActiveOpt
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-foreground ring-1 ring-emerald-500/30"
                                    : "bg-amber-500/10 border-amber-500/40 text-foreground ring-1 ring-amber-500/30"
                                : "bg-card hover:bg-muted/40 border-border text-muted-foreground"
                        )}
                    >
                        <div
                            className={cn(
                                "h-4 w-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                isSelected
                                    ? isActiveOpt
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-amber-500 bg-amber-500 text-white"
                                    : "border-muted-foreground/50 bg-transparent"
                            )}
                        >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-sm font-semibold", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                    {opt.label}
                                </span>
                                {isSelected && (
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px] px-1.5 py-0 font-medium",
                                            isActiveOpt
                                                ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                                : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                                        )}
                                    >
                                        Selected
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {opt.description}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Field wrapper — keeps label / icon / input / error markup consistent and DRY
// ---------------------------------------------------------------------------

function Field({
    id,
    label,
    icon,
    error,
    required,
    children,
    className,
}: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    error?: string;
    className?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={cn("space-y-1.5", className)}>
            <Label htmlFor={id} className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                {icon}
                <span>{label}</span>
                {required && <span className="text-destructive">*</span>}
            </Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-xs font-medium text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AddEmployeePage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [values, setValues] = useState<EmployeeFormValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (data: any) => employeeService.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            toast.success("Employee added successfully");
            router.push("/admin/employees");
        },
        onError: (err: any) => {
            const message = err?.response?.data?.message || err?.message || "Couldn't add the employee. Try again.";
            setSubmitError(message);
            toast.error(message);
        }
    });

    function updateField<K extends keyof EmployeeFormValues>(
        key: K,
        value: EmployeeFormValues[K]
    ) {
        setValues((prev) => ({ ...prev, [key]: value }));
        // Clear that field's error as soon as the user starts correcting it
        if (key in errors) {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const validationErrors = validate(values);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        setSubmitError(null);

        mutation.mutate({
            employee_name: values.name,
            employee_email: values.email,
            employee_address: values.address,
            status: values.status
        });
    }

    return (
        <div className="w-full  bg-card border border-border text-card-foreground rounded-lg p-4 shadow-xs h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-5.5rem)] flex flex-col min-h-0 overflow-hidden">
            {/* Top Navigation & Header Card */}
            <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-2 rounded-sm border border-border bg-card text-card-foreground shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                        title="Back to employees"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                  
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                            Add New Employee
                        </h1>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Create an employee record and configure operational permissions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.back()}
                        className="cursor-pointer text-xs sm:text-sm"
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="flex-1 min-h-0 flex flex-col rounded-sm border border-border bg-card text-card-foreground shadow-xs overflow-hidden mt-3 sm:mt-4">
                <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* SCROLLABLE FORM FIELDS CONTAINER */}
                    <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 table-scrollbar">
                        {submitError && (
                            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive flex items-center gap-2.5 animate-in fade-in">
                                <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                                <span>{submitError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {/* Employee Name */}
                            <Field
                                id="name"
                                label="Employee Name"
                                icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
                                error={errors.name}
                                required
                            >
                                <Input
                                    id="name"
                                    placeholder="e.g. Ananya Roy"
                                    value={values.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    aria-invalid={!!errors.name}
                                    aria-describedby={errors.name ? "name-error" : undefined}
                                    className={cn(
                                        "h-10 text-sm bg-background border-[0.5px] border-input placeholder:text-muted-foreground shadow-2xs focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:border-[0.5px]",
                                        errors.name && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                            </Field>

                            {/* Employee Email */}
                            <Field
                                id="email"
                                label="Employee Email"
                                icon={<Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                                error={errors.email}
                                required
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="e.g. ananya.roy@company.com"
                                    value={values.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    className={cn(
                                        "h-10 text-sm bg-background border-[0.5px] border-input placeholder:text-muted-foreground shadow-2xs focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:border-[0.5px]",
                                        errors.email && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                            </Field>
                        </div>

                        {/* Employee Address */}
                        <Field
                            id="address"
                            label="Employee Address"
                            icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
                            error={errors.address}
                            required
                        >
                            <Input
                                id="address"
                                placeholder="e.g. Tarakeswar, Hooghly"
                                value={values.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                aria-invalid={!!errors.address}
                                aria-describedby={errors.address ? "address-error" : undefined}
                                className={cn(
                                    "h-10 text-sm bg-background border-[0.5px] border-input placeholder:text-muted-foreground shadow-2xs focus-visible:ring-[0.5px] focus-visible:ring-ring focus-visible:border-[0.5px]",
                                    errors.address && "border-destructive focus-visible:ring-destructive"
                                )}
                            />
                        </Field>

                        {/* Status */}
                        <div className="space-y-2 pt-1">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                Account Status
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Inactive employees cannot log in or record submissions.
                            </p>
                            <StatusToggle
                                value={values.status}
                                onChange={(status) => updateField("status", status)}
                            />
                        </div>
                    </div>

                    {/* Form Action Footer - FIXED PINNED AT BOTTOM */}
                    <div className="shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-border bg-card">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={mutation.isPending}
                            className="w-full sm:w-auto cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={mutation.isPending}
                            className="w-full sm:w-auto cursor-pointer font-medium shadow-xs"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding Employee...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Employee
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
