"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { employeeService } from "@/services/employee-services";

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
// Status segmented control — kept local since it's a two-option toggle,
// not worth pulling in a full Select/RadioGroup dependency for.
// ---------------------------------------------------------------------------

function StatusToggle({
    value,
    onChange,
}: {
    value: EmployeeStatus;
    onChange: (status: EmployeeStatus) => void;
}) {
    const options: { label: string; value: EmployeeStatus }[] = [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        <div
            role="radiogroup"
            aria-label="Employee status"
            className="inline-flex"
        >
            {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-[6px] px-3.5 py-1.5 text-sm font-medium transition-colors",
                            isSelected
                                ? opt.value === "active"
                                    ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                                    : "bg-zinc-200 text-zinc-700 shadow-sm ring-1 ring-zinc-300"
                                : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                isSelected
                                    ? opt.value === "active"
                                        ? "bg-emerald-500"
                                        : "bg-zinc-500"
                                    : "bg-zinc-300"
                            )}
                        />
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Field wrapper — keeps label / input / error markup consistent and DRY
// ---------------------------------------------------------------------------

function Field({
    id,
    label,
    error,
    required,
    children,
    className,
}: {
    id: string;
    label: string;
    error?: string;
    className?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className={`grid gap-1.5 ${className}`}>
            <Label htmlFor={id}>
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </Label>
            {children}
            {error && (
                <p id={`${id}-error`} className="text-xs font-medium text-red-500">
                    {error}
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

    const [values, setValues] = useState<EmployeeFormValues>(INITIAL_VALUES);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const mutation = useMutation({
        mutationFn: (data: any) => employeeService.createEmployee(data),
        onSuccess: () => {
            router.push("/admin/employees");
            router.refresh();
        },
        onError: () => {
            setSubmitError("Couldn't add the employee. Try again.");
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
        <div className="w-full bg-[#fff] border border-[#f1f5fe]! rounded-sm    h-full">
            <div className=" border-b  flex justify-between items-center p-2">

                <Button type="button" className="w-fit cursor-pointer" variant="secondary" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to employees
                </Button>

            </div>
            <div className="p-2 ">
                <div className="flex items-center gap-2.5 pb-4 ">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e7ecf7]">
                        <UserPlus className="h-4.5 w-4.5 text-zinc-600" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-zinc-800">Add employee</h1>
                        <p className="text-xs text-zinc-400">Create a new employee record.</p>
                    </div>
                </div>
                <div className="h-full p-4 overflow-y-auto">
                <form onSubmit={handleSubmit} noValidate className="grid ">
                    <Field id="name" label="Employee name" error={errors.name} required className="mb-5">
                        <Input
                            id="name"
                            placeholder="Ananya Roy"
                            value={values.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? "name-error" : undefined}
                        />
                    </Field>

                    <Field id="email" label="Employee email" error={errors.email} required className="mb-5">
                        <Input
                            id="email"
                            type="email"
                            placeholder="ananya.roy@company.com"
                            value={values.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                    </Field>

                    <Field id="address" label="Employee address" error={errors.address} required className="mb-5">
                        <Input
                            id="address"
                            placeholder="Tarakeswar, Hooghly"
                            value={values.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            aria-invalid={!!errors.address}
                            aria-describedby={errors.address ? "address-error" : undefined}
                        />
                    </Field>

                    <div className="grid gap-1.5 mb-5">
                        <Label>Status</Label>
                        <StatusToggle
                            value={values.status}
                            onChange={(status) => updateField("status", status)}
                        />
                    </div>

                    {submitError && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                            {submitError}
                        </p>
                    )}

                    <div className="mt-2 flex items-center justify-end gap-2 border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={mutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                "Add employee"
                            )}
                        </Button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
}