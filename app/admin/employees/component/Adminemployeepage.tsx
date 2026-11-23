"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Users,
    FolderOpenDot,
    FileStack,
    AlertCircle,
    Eye,
    Pencil,
    Trash2,
    Ban,
    RotateCcw,
    Inbox,
    MoreHorizontal,
    User,
    Mail,
    MapPin,
    Clock,
    FileText,
    Hash,
    Copy,
    Check,
    ShieldCheck,
    Loader2,
    Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee-services";
import { TableSkeleton } from "@/components/ui/tableskeleton";

type EmployeeStatus = "active" | "inactive";

interface Employee {
    id: string;
    name: string;
    email: string;
    adress: string;
    recordsThisMonth: number;
    pendingReview: boolean;
    status: EmployeeStatus;
    lastActive: string;
}

interface ActivityItem {
    id: string;
    employeeName: string;
    action: string;
    detail: string;
    timestamp: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
    { id: "e1", name: "Ananya Roy", email: "ananya.roy@company.com", adress: "Tarakeswar,Hooghly", recordsThisMonth: 42, pendingReview: true, status: "active", lastActive: "2026-07-24T09:12:00Z" },
    { id: "e2", name: "Rahul Sen", email: "rahul.sen@company.com", adress: "HR", recordsThisMonth: 18, pendingReview: false, status: "active", lastActive: "2026-07-23T14:40:00Z" },
    { id: "e3", name: "Priya Das", email: "priya.das@company.com", adress: "Operations", recordsThisMonth: 65, pendingReview: true, status: "active", lastActive: "2026-07-24T11:02:00Z" },
    { id: "e4", name: "Sourav Ghosh", email: "sourav.ghosh@company.com", adress: "IT", recordsThisMonth: 9, pendingReview: false, status: "inactive", lastActive: "2026-07-10T08:15:00Z" },
    { id: "e5", name: "Mitali Chatterjee", email: "mitali.c@company.com", adress: "Finance", recordsThisMonth: 27, pendingReview: false, status: "active", lastActive: "2026-07-22T16:30:00Z" },
    { id: "e6", name: "Arjun Bose", email: "arjun.bose@company.com", adress: "Sales", recordsThisMonth: 12, pendingReview: true, status: "active", lastActive: "2026-07-21T10:05:00Z" },
    { id: "e7", name: "Debjani Mukherjee", email: "debjani.m@company.com", adress: "Legal", recordsThisMonth: 5, pendingReview: false, status: "inactive", lastActive: "2026-07-02T12:00:00Z" },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
    { id: "a1", employeeName: "Ananya Roy", action: "Uploaded", detail: "Q2 expense report", timestamp: "2026-07-24T09:12:00Z" },
    { id: "a2", employeeName: "Priya Das", action: "Updated", detail: "Inventory record #3391", timestamp: "2026-07-24T11:02:00Z" },
    { id: "a3", employeeName: "Arjun Bose", action: "Uploaded", detail: "Client contract draft", timestamp: "2026-07-21T10:05:00Z" },
];

const ACTIVE_TEMPLATES_COUNT = 14;

function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium border",
                status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                    : "bg-muted text-muted-foreground border-border"
            )}
        >
            <span
                className={cn(
                    "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                    status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                )}
            />
            {status === "active" ? "Active" : "Inactive"}
        </Badge>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 text-center">
            <Inbox className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Nothing to show here yet.</p>
        </div>
    );
}

export default function Adminemployeepage() {
    const [activity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [viewTarget, setViewTarget] = useState<Employee | null>(null);
    const [editTarget, setEditTarget] = useState<Employee | null>(null);
    const [editDraft, setEditDraft] = useState({ name: "", email: "", adress: "" });
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [statusTarget, setStatusTarget] = useState<Employee | null>(null);
    const [copiedId, setCopiedId] = useState(false);

    const handleCopyId = (id?: string) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedId(true);
        toast.success("Employee ID copied to clipboard");
        setTimeout(() => setCopiedId(false), 2000);
    };

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["employees", page, perPage],
        queryFn: () => employeeService.getEmployees(page, perPage),
    });

    const backendEmployees = data?.employees || [];
    const totalItems = data?.total || 0;

    const employees: Employee[] = useMemo(() => {
        let list = backendEmployees.map((emp: any) => ({
            id: emp._id,
            name: emp.employee_name || "",
            email: emp.employee_email || "",
            adress: emp.employee_address || "",
            recordsThisMonth: 0,
            pendingReview: false,
            status: emp.status || "inactive",
            lastActive: new Date().toISOString()
        }));

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            list = list.filter((emp: Employee) => 
                emp.name.toLowerCase().includes(lower) || 
                emp.email.toLowerCase().includes(lower) || 
                emp.adress?.toLowerCase().includes(lower)
            );
        }
        return list;
    }, [backendEmployees, searchTerm]);

    const editMutation = useMutation({
        mutationFn: (data: { id: string, payload: any }) => employeeService.updateEmployee(data.id, data.payload),
        onMutate: async (newEmp) => {
            await queryClient.cancelQueries({ queryKey: ["employees"] });
            const previousData = queryClient.getQueryData(["employees"]);
            setEditTarget(null);
            return { previousData };
        },
        onError: (err, newEmp, context) => {
            if (context?.previousData) {
                queryClient.setQueriesData({ queryKey: ["employees"] }, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => employeeService.deleteEmployee(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["employees"] });
            const previousData = queryClient.getQueryData(["employees"]);
            queryClient.setQueriesData({ queryKey: ["employees"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    employees: old.employees.filter((emp: any) => emp._id !== id)
                };
            });
            setDeleteTarget(null);
            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueriesData({ queryKey: ["employees"] }, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        }
    });

    const toggleMutation = useMutation({
        mutationFn: (id: string) => employeeService.toggleStatus(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["employees"] });
            const previousData = queryClient.getQueryData(["employees"]);
            
            queryClient.setQueriesData({ queryKey: ["employees"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    employees: old.employees.map((emp: any) => 
                        emp._id === id ? { ...emp, status: emp.status === "active" ? "inactive" : "active" } : emp
                    )
                };
            });
            setStatusTarget(null);
            return { previousData };
        },
        onError: (err, id, context) => {
            if (context?.previousData) {
                queryClient.setQueriesData({ queryKey: ["employees"] }, context.previousData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        }
    });

    const handlePerPageChange = (value: string | number) => {
        setPerPage(Number(value));
        setPage(1);
    };

    function openEdit(emp: Employee) {
        setEditTarget(emp);
        setEditDraft({ name: emp.name, email: emp.email, adress: emp.adress });
    }

    function saveEdit() {
        if (!editTarget) return;
        editMutation.mutate({
            id: editTarget.id,
            payload: {
                employee_name: editDraft.name,
                employee_email: editDraft.email,
                employee_address: editDraft.adress
            }
        });
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
    }

    function confirmStatusToggle() {
        if (!statusTarget) return;
        toggleMutation.mutate(statusTarget.id);
    }

    const EMPLOYEE_SKELETON_COLUMNS: React.ComponentProps<typeof TableSkeleton>["columns"] = [
        { kind: "text", className: "w-[150px] min-w-[150px]", barWidth: "65%" },
        { kind: "text", className: "w-[240px] min-w-[240px]", barWidth: "75%" },
        { kind: "text", className: "w-[180px] min-w-[180px]", barWidth: "55%" },
        { kind: "text", className: "w-[100px] min-w-[100px]", barWidth: "30%" },
        { kind: "badge", className: "w-[120px] min-w-[120px]", barWidth: "68px" },
        { kind: "text", className: "w-[160px] min-w-[160px]", barWidth: "116px" },
        { kind: "actions", className: "w-[80px] min-w-[80px]", align: "right", actionCount: 1 },
    ];

    return (
        <div className="flex flex-col mt-3!">
            <div className="flex w-full flex-1 min-h-0 flex-col rounded-lg border border-border bg-card text-card-foreground shadow-xs mt-0 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-border p-3 sm:p-4 bg-card">
                    <div className="w-full sm:max-w-[400px]">
                        <Input
                            type="search"
                            placeholder="Search employees..."
                            isLoading={isSearching}
                            onChange={() => setIsSearching(true)}
                            onDebouncedChange={(value) => {
                                setSearchTerm(value);
                                setIsSearching(false);
                            }}
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <Button type="button" className="w-full cursor-pointer shadow-xs" variant="default" onClick={() => router.push("/admin/employees/addemployee")}>
                            Add Employee
                        </Button>
                    </div>
                </div>

                <div className="w-full">
                    <div className="h-[calc(100vh-312px)] overflow-y-auto overflow-x-auto w-full relative table-scrollbar">
                        <table className="w-full text-sm whitespace-nowrap min-w-[850px] border-collapse">
                            <thead className="sticky top-0 z-20 bg-muted border-b border-border shadow-xs">
                                <tr>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Name</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Email</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Address</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Records</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Status</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-left">Last active</th>
                                    <th className="px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground bg-muted sticky top-0 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 bg-card">
                                {isLoading ? (
                                    <TableSkeleton columns={EMPLOYEE_SKELETON_COLUMNS} />
                                ) : employees.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="h-[300px]">
                                            <EmptyState label="No employees found" />
                                        </td>
                                    </tr>
                                ) : (
                                    employees.map((emp) => (
                                        <tr
                                            key={emp.id}
                                            className="hover:bg-muted/40 transition-colors"
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="font-medium text-foreground">{emp.name}</div>
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground">{emp.email}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground">{emp.adress}</td>
                                            <td className="px-5 py-3.5 text-muted-foreground font-medium">{emp.recordsThisMonth}</td>
                                            <td className="px-5 py-3.5">
                                                <StatusBadge status={emp.status} />
                                            </td>
                                            <td className="px-5 py-3.5 text-muted-foreground text-xs">
                                                {formatDateTime(emp.lastActive)}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => setViewTarget(emp), 50)} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(emp), 50)} className="cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => setStatusTarget(emp), 50)} className="cursor-pointer">
                                                                {emp.status === "active" ? (
                                                                    <>
                                                                        <Ban className="mr-2 h-4 w-4 text-amber-600" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <RotateCcw className="mr-2 h-4 w-4 text-emerald-600" />
                                                                        Reactivate
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => setDeleteTarget(emp), 50)} className="text-destructive focus:text-destructive cursor-pointer">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
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

            {/* View dialog */}
            <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
                <DialogContent className="w-[96vw] max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 shrink-0 pr-12">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                                        Employee Details
                                    </DialogTitle>
                                    {viewTarget && <StatusBadge status={viewTarget.status} />}
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                                    <span>Profile Information</span>
                                    <span>•</span>
                                    <span>
                                        {viewTarget?.lastActive
                                            ? `Last active: ${formatDateTime(viewTarget.lastActive)}`
                                            : "Registered Employee"}
                                    </span>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/15 space-y-5">
                        {viewTarget && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Left Column: Profile Card (5 cols) */}
                                <div className="lg:col-span-5 space-y-4">
                                    {/* Primary Profile Card */}
                                    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-border">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-primary" /> Profile Overview
                                            </span>
                                            <StatusBadge status={viewTarget.status} />
                                        </div>

                                        <div className="flex flex-col items-center text-center p-3">
                                            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-xs mb-3">
                                                {viewTarget.name?.charAt(0)?.toUpperCase() || "E"}
                                            </div>
                                            <h3 className="font-bold text-base sm:text-lg text-foreground truncate max-w-full">
                                                {viewTarget.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate max-w-full flex items-center gap-1.5 mt-1">
                                                <Mail className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                                                <span className="truncate">{viewTarget.email}</span>
                                            </p>
                                        </div>

                                        {/* Employee ID Chip */}
                                        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                    <Hash className="h-3 w-3" /> Employee ID
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyId(viewTarget.id)}
                                                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                                                >
                                                    {copiedId ? (
                                                        <>
                                                            <Check className="h-3 w-3 text-emerald-600" />
                                                            <span className="text-emerald-600">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="font-mono text-xs font-medium text-foreground truncate select-all">
                                                {viewTarget.id}
                                            </p>
                                        </div>

                                        {/* Quick Metrics */}
                                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                                            <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-center">
                                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                                                    Records This Month
                                                </span>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <FileText className="h-4 w-4 text-primary" />
                                                    <span className="text-base font-bold text-foreground">
                                                        {viewTarget.recordsThisMonth}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg bg-muted/40 p-3 border border-border/50 text-center">
                                                <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                                                    Account Status
                                                </span>
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span
                                                        className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            viewTarget.status === "active" ? "bg-emerald-500" : "bg-muted-foreground"
                                                        )}
                                                    />
                                                    <span className="text-sm font-semibold capitalize text-foreground">
                                                        {viewTarget.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Detailed Information (7 cols) */}
                                <div className="lg:col-span-7">
                                    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between pb-3.5 border-b border-border">
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base text-foreground">
                                                        Employee Information
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Account details and contact information
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs border-border shrink-0">
                                                    Profile Data
                                                </Badge>
                                            </div>

                                            {/* Info Fields Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5 text-primary" /> Full Name
                                                    </span>
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {viewTarget.name || "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
                                                    </span>
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {viewTarget.email || "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1 sm:col-span-2">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" /> Address / Location
                                                    </span>
                                                    <p className="text-sm font-semibold text-foreground break-words">
                                                        {viewTarget.adress || "Not provided"}
                                                    </p>
                                                </div>

                                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Access Status
                                                    </span>
                                                    <div className="pt-0.5 flex items-center gap-2">
                                                        <StatusBadge status={viewTarget.status} />
                                                        <span className="text-xs text-muted-foreground">
                                                            {viewTarget.status === "active" ? "Access granted" : "Access suspended"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5 text-primary" /> Last Active
                                                    </span>
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {formatDateTime(viewTarget.lastActive)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>Registered in organization</span>
                                            <span className="font-mono text-[11px]">System Account</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setViewTarget(null)}
                            className="cursor-pointer flex-1 sm:flex-initial"
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={() => {
                                const target = viewTarget;
                                setViewTarget(null);
                                if (target) {
                                    setTimeout(() => openEdit(target), 100);
                                }
                            }}
                            className="cursor-pointer flex-1 sm:flex-initial"
                        >
                            <Pencil className="h-4 w-4 mr-1.5" /> Edit Employee
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="w-[96vw] max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border border-border bg-card shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card/95 shrink-0 pr-12">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
                                <Pencil className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <DialogTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">
                                        Edit Employee Profile
                                    </DialogTitle>
                                    {editTarget && <StatusBadge status={editTarget.status} />}
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 truncate">
                                    <span>Update account details and personal information</span>
                                    <span>•</span>
                                    <span>{editTarget?.name || "Employee"}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-muted/15 space-y-5">
                        {editTarget && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                {/* Left Column: Current Profile Summary (5 cols) */}
                                <div className="lg:col-span-5 space-y-4">
                                    <div className="rounded-lg border border-border bg-card p-5 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-border">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-primary" /> Profile Preview
                                            </span>
                                            <StatusBadge status={editTarget.status} />
                                        </div>

                                        <div className="flex flex-col items-center text-center p-3">
                                            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-xs mb-3">
                                                {(editDraft.name || editTarget.name)?.charAt(0)?.toUpperCase() || "E"}
                                            </div>
                                            <h3 className="font-bold text-base sm:text-lg text-foreground truncate max-w-full">
                                                {editDraft.name || editTarget.name || "Employee Name"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate max-w-full flex items-center gap-1.5 mt-1">
                                                <Mail className="h-3 w-3 shrink-0 text-muted-foreground/80" />
                                                <span className="truncate">{editDraft.email || editTarget.email}</span>
                                            </p>
                                        </div>

                                        {/* Employee ID Chip */}
                                        <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                    <Hash className="h-3 w-3" /> Employee ID
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyId(editTarget.id)}
                                                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
                                                >
                                                    {copiedId ? (
                                                        <>
                                                            <Check className="h-3 w-3 text-emerald-600" />
                                                            <span className="text-emerald-600">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="h-3 w-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="font-mono text-xs font-medium text-foreground truncate select-all">
                                                {editTarget.id}
                                            </p>
                                        </div>

                                        {/* System Info Box */}
                                        <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2">
                                            <div className="flex items-start gap-2">
                                                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                    Changes to employee information will immediately take effect and update system records.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Form Inputs (7 cols) */}
                                <div className="lg:col-span-7">
                                    <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-xs space-y-5 h-full flex flex-col justify-between">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-3.5 border-b border-border">
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base text-foreground">
                                                        Edit Information
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        Modify the fields below to update employee details
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs border-border shrink-0">
                                                    Required *
                                                </Badge>
                                            </div>

                                            <div className="space-y-4 pt-1">
                                                {/* Full Name */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="edit-name" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                        <User className="h-3.5 w-3.5 text-primary" /> Full Name <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="edit-name"
                                                        value={editDraft.name}
                                                        onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                                                        placeholder="Enter employee full name"
                                                        className="h-10 text-sm bg-background border-border shadow-xs focus-visible:ring-1"
                                                    />
                                                </div>

                                                {/* Email Address */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="edit-email" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 text-primary" /> Email Address <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        id="edit-email"
                                                        type="email"
                                                        value={editDraft.email}
                                                        onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                                                        placeholder="e.g. employee@company.com"
                                                        className="h-10 text-sm bg-background border-border shadow-xs focus-visible:ring-1"
                                                    />
                                                </div>

                                                {/* Address / Location */}
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="edit-address" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-primary" /> Address / Location
                                                    </Label>
                                                    <Input
                                                        id="edit-address"
                                                        value={editDraft.adress}
                                                        onChange={(e) => setEditDraft((d) => ({ ...d, adress: e.target.value }))}
                                                        placeholder="Enter office address or department location"
                                                        className="h-10 text-sm bg-background border-border shadow-xs focus-visible:ring-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                Account credentials and permissions are preserved
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 sm:px-6 py-3.5 border-t border-border bg-card shrink-0 flex flex-col sm:flex-row items-center justify-end gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setEditTarget(null)}
                            disabled={editMutation.isPending}
                            className="cursor-pointer flex-1 sm:flex-initial"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            onClick={saveEdit}
                            disabled={editMutation.isPending || !editDraft.name.trim() || !editDraft.email.trim()}
                            className="cursor-pointer flex-1 sm:flex-initial"
                        >
                            {editMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-1.5" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This removes the employee record and all associated data. This action can&apos;t be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Activate / deactivate confirmation */}
            <AlertDialog open={!!statusTarget} onOpenChange={(open) => !open && setStatusTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {statusTarget?.status === "active" ? "Deactivate" : "Reactivate"} {statusTarget?.name}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {statusTarget?.status === "active"
                                ? "This user will no longer be able to upload, edit, or delete data until reactivated."
                                : "This user will regain the ability to upload, edit, and delete data."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmStatusToggle} disabled={toggleMutation.isPending}>
                            {toggleMutation.isPending
                                ? "Processing..."
                                : statusTarget?.status === "active" ? "Deactivate" : "Reactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
