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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination, PerPageSelect } from "@/components/ui/pagination";

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
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [activity] = useState<ActivityItem[]>(INITIAL_ACTIVITY);
    const router = useRouter();
    const [viewTarget, setViewTarget] = useState<Employee | null>(null);
    const [editTarget, setEditTarget] = useState<Employee | null>(null);
    const [editDraft, setEditDraft] = useState({ name: "", email: "", adress: "" });
    const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
    const [statusTarget, setStatusTarget] = useState<Employee | null>(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const totalItems = 137;
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
        setEmployees((prev) =>
            prev.map((e) => (e.id === editTarget.id ? { ...e, ...editDraft } : e))
        );
        setEditTarget(null);
    }

    function confirmDelete() {
        if (!deleteTarget) return;
        setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
        setDeleteTarget(null);
    }

    function confirmStatusToggle() {
        if (!statusTarget) return;
        setEmployees((prev) =>
            prev.map((e) =>
                e.id === statusTarget.id
                    ? { ...e, status: e.status === "active" ? "inactive" : "active" }
                    : e
            )
        );
        setStatusTarget(null);
    }

    return (
        <div className="">
            {/* ---------------------------------------------------------------- */}
            {/* Stats + employee table                                           */}
            {/* ---------------------------------------------------------------- */}


            <div className="w-full rounded-[10px] border border-[#bec1c7a1]! bg-white  mt-4">

                <div className="flex justify-start gap-2 border-b px-2 py-2">
                    <div className="w-full max-w-[400px]">
                        <Input id="employe_search" type="name" placeholder="Search Employees..." onClick={() => router.push("/admin/employees/addemployee")} />
                    </div>
                    <div className="">
                        <Button type="submit" className="w-full cursor-pointer" variant="outline">
                            Add Employee
                        </Button>
                    </div>
                </div>

                {/* Employee table — scrolls both ways so it never breaks layout */}
                <div className="w-full grid">
                    <div className="max-h-[calc(100vh-250px)] overflow-y-auto overflow-x-auto">
                        <table className="w-full  text-sm">
                            <thead className="sticky top-0 z-10 bg-[#e7ecf7]  text-left text-xs uppercase tracking-wide text-zinc-500">
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
                                {employees.length === 0 ? (
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
                                                {/* <div className="text-xs text-zinc-400"></div> */}
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
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="View"
                                                        onClick={() => setViewTarget(emp)}
                                                    >
                                                        <Eye className="h-4 w-4 text-zinc-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Edit"
                                                        onClick={() => openEdit(emp)}
                                                    >
                                                        <Pencil className="h-4 w-4 text-zinc-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title={emp.status === "active" ? "Deactivate user" : "Reactivate user"}
                                                        onClick={() => setStatusTarget(emp)}
                                                    >
                                                        {emp.status === "active" ? (
                                                            <Ban className="h-4 w-4 text-amber-600" />
                                                        ) : (
                                                            <RotateCcw className="h-4 w-4 text-emerald-600" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        title="Delete"
                                                        onClick={() => setDeleteTarget(emp)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                <div className="flex justify-between items-center gap-2 px-2 py-2">
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
                            {/* <div>
                <div className="text-xs text-zinc-400">Department</div>
                <div className="text-zinc-800">{viewTarget.department}</div>
              </div> */}
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
                            {/* <div className="grid gap-1.5">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={editDraft.department}
                  onChange={(e) => setEditDraft((d) => ({ ...d, department: e.target.value }))}
                />
              </div> */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="role">Address</Label>
                                <Input
                                    id="role"
                                    value={editDraft.adress}
                                    onChange={(e) => setEditDraft((d) => ({ ...d, address: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>
                            Cancel
                        </Button>
                        <Button onClick={saveEdit}>Save changes</Button>
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
                        >
                            Delete
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
                        <AlertDialogAction onClick={confirmStatusToggle}>
                            {statusTarget?.status === "active" ? "Deactivate" : "Reactivate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}