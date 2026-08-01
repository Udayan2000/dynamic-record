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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "@/services/employee-services";
import { TableSkeleton } from "@/components/ui/tableskeleton";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EmployeeStatus = "active" | "inactive";

interface Employee {
    id: string;
    name: string;
    email: string;
    //   department: string;
    adress: string;
    recordsThisMonth: number;
    pendingReview: boolean;
    status: EmployeeStatus;
    lastActive: string; // ISO date string
}

interface ActivityItem {
    id: string;
    employeeName: string;
    action: string;
    detail: string;
    timestamp: string;
}

// ---------------------------------------------------------------------------
// Seed data — replace with a fetch() / server action call in production.
// Everything below is driven off this state, nothing is hard-coded in JSX.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

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
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-zinc-100 text-zinc-500 border-zinc-200"
            )}
        >
            <span
                className={cn(
                    "mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
                    status === "active" ? "bg-emerald-500" : "bg-zinc-400"
                )}
            />
            {status === "active" ? "Active" : "Inactive"}
        </Badge>
    );
}

/** Keeps a panel at a fixed, full height whether or not it has data. */
function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-2 text-center">
            <Inbox className="h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="text-xs text-zinc-400">Nothing to show here yet.</p>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function Adminemployeepage() {
    const [activity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
    const router = useRouter();
    const queryClient = useQueryClient();
    const [viewTarget, setViewTarget] = useState<Employee | null>(null);
    const [editTarget, setEditTarget] = useState<Employee | null>(null);
    const [editDraft, setEditDraft] = useState({ name: "", email: "", adress: "" });
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [statusTarget, setStatusTarget] = useState<Employee | null>(null);

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
            
            queryClient.setQueriesData({ queryKey: ["employees"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    employees: old.employees.map((emp: any) => 
                        emp._id === newEmp.id ? { ...emp, ...newEmp.payload } : emp
                    )
                };
            });
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

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        setPage(1);
    };

    // Stats derived live from employee state — nothing here is hard-coded.
    const stats = useMemo(() => {
        const totalEmployees = employees.length;
        const recordsThisMonth = employees.reduce((sum, e) => sum + e.recordsThisMonth, 0);
        const pendingReview = employees.filter((e) => e.pendingReview).length;
        return [
            { label: "Total employees", value: String(totalEmployees), icon: Users },
            { label: "Records this month", value: String(recordsThisMonth), icon: FolderOpenDot },
            { label: "Active templates", value: String(ACTIVE_TEMPLATES_COUNT), icon: FileStack },
            { label: "Pending review", value: String(pendingReview), icon: AlertCircle },
        ];
    }, [employees]);

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
        <div className="flex flex-col">
            {/* ---------------------------------------------------------------- */}
            {/* Stats + employee table                                           */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex w-full flex-1 min-h-0 flex-col rounded-[10px] border border-[#bec1c7a1] bg-white mt-4">

                <div className="flex flex-col sm:flex-row justify-between gap-2 border-b px-4 py-3">
                    <div className="w-full max-w-[400px]">
                        {/* <Input id="employe_search" type="name" placeholder="Search Employees..." /> */}
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
                    <div className="">
                        <Button type="submit" className="w-full cursor-pointer" variant="default" onClick={() => router.push("/admin/employees/addemployee")}>
                            Add Employee
                        </Button>
                    </div>
                </div>

                {/* Employee table — scrolls both ways so it never breaks layout */}
                <div className="grid w-full p-1">
                    <div className="h-[calc(100vh-290px)] overflow-y-auto overflow-x-auto w-full">
                        <table className="w-full text-sm whitespace-nowrap min-w-[800px]">
                            <thead className="sticky top-0 z-10 bg-[#e7ecf7] text-left text-xs uppercase tracking-wide text-zinc-500">
                                <tr>
                                    <th className="px-3 py-2.5 font-medium">Name</th>
                                    <th className="px-3 py-2.5 font-medium">Email</th>
                                    <th className="px-3 py-2.5 font-medium">Address</th>
                                    <th className="px-3 py-2.5 font-medium">Records</th>
                                    <th className="px-3 py-2.5 font-medium">Status</th>
                                    <th className="px-3 py-2.5 font-medium">Last active</th>
                                    <th className="px-3 py-2.5 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                            className="border-b border-[#f1f5fe] hover:bg-[#fafbff]"
                                        >
                                            <td className="px-3 py-2.5">
                                                <div className="font-medium text-zinc-800">{emp.name}</div>
                                            </td>
                                            <td className="px-3 py-2.5 text-zinc-600">{emp.email}</td>
                                            <td className="px-3 py-2.5 text-zinc-600">{emp.adress}</td>
                                            <td className="px-3 py-2.5 text-zinc-600">{emp.recordsThisMonth}</td>
                                            <td className="px-3 py-2.5">
                                                <StatusBadge status={emp.status} />
                                            </td>
                                            <td className="px-3 py-2.5 text-zinc-500">
                                                {formatDateTime(emp.lastActive)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-zinc-500 hover:text-zinc-800"
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => setViewTarget(emp), 50)} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4 text-zinc-500" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => openEdit(emp), 50)} className="cursor-pointer">
                                                                <Pencil className="mr-2 h-4 w-4 text-zinc-500" />
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
                                                            <DropdownMenuItem onSelect={() => setTimeout(() => setDeleteTarget(emp), 50)} className="text-red-600 focus:text-red-600 cursor-pointer">
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

            {/* ---------------------------------------------------------------- */}
            {/* View dialog                                                       */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{viewTarget?.name}</DialogTitle>
                        <DialogDescription>{viewTarget?.email}</DialogDescription>
                    </DialogHeader>
                    {viewTarget && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-xs text-zinc-400">Address</div>
                                <div className="text-zinc-800">{viewTarget.adress}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400">Records this month</div>
                                <div className="text-zinc-800">{viewTarget.recordsThisMonth}</div>
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400">Status</div>
                                <StatusBadge status={viewTarget.status} />
                            </div>
                            <div>
                                <div className="text-xs text-zinc-400">Last active</div>
                                <div className="text-zinc-800">{formatDateTime(viewTarget.lastActive)}</div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ---------------------------------------------------------------- */}
            {/* Edit dialog                                                       */}
            {/* ---------------------------------------------------------------- */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit employee</DialogTitle>
                        <DialogDescription>Update details for {editTarget?.name}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3">
                        <div className="grid gap-1.5">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editDraft.name}
                                onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={editDraft.email}
                                onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label htmlFor="role">Address</Label>
                                <Input
                                    id="role"
                                    value={editDraft.adress}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, adress: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>
                            Cancel
                        </Button>
                        <Button onClick={saveEdit} disabled={editMutation.isPending}>
                            {editMutation.isPending ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------------------------------------------------------- */}
            {/* Delete confirmation                                               */}
            {/* ---------------------------------------------------------------- */}
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
                            className="bg-red-600 hover:bg-red-700"
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---------------------------------------------------------------- */}
            {/* Activate / deactivate confirmation                                */}
            {/* ---------------------------------------------------------------- */}
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