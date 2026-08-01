// components/ui/table-skeleton.tsx
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SkeletonColumnKind = "text" | "badge" | "avatar-text" | "actions";

interface SkeletonColumn {
    kind: SkeletonColumnKind;
    /** Tailwind width classes matching the real <th>/<td> (keeps layout stable) */
    className: string;
    /** Width of the shimmer bar itself, as a % or fixed value (e.g. "70%", "3rem") */
    barWidth?: string;
    /** Number of action icons to render, only used when kind === "actions" */
    actionCount?: number;
    align?: "left" | "right" | "center";
}

interface TableSkeletonProps {
    columns: SkeletonColumn[];
    rows?: number;
    /** Adds slight width variance per row so it doesn't look robotic */
    randomizeWidths?: boolean;
}

// ---------------------------------------------------------------------------
// Shimmer primitive
// ---------------------------------------------------------------------------

function ShimmerBar({
    width = "100%",
    height = "h-4",
    rounded = "rounded",
}: {
    width?: string;
    height?: string;
    rounded?: string;
}) {
    return (
        <div
            className={cn(
                "animate-pulse bg-zinc-200/80",
                height,
                rounded
            )}
            style={{ width }}
        />
    );
}

// ---------------------------------------------------------------------------
// Per-cell renderer — dispatches on column kind
// ---------------------------------------------------------------------------

function SkeletonCell({
    column,
    seed,
}: {
    column: SkeletonColumn;
    seed: number;
}) {
    // Deterministic pseudo-random variance per row/column so widths differ
    // slightly without shifting on every re-render.
    const jitter = ((seed * 37) % 20) - 10; // -10..+10

    const resolveWidth = (base: string) => {
        if (!base.endsWith("%")) return base;
        const pct = Math.max(30, Math.min(95, parseInt(base) + jitter));
        return `${pct}%`;
    };

    switch (column.kind) {
        case "avatar-text":
            return (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-zinc-200/80" />
                    <ShimmerBar width={resolveWidth(column.barWidth ?? "70%")} />
                </div>
            );

        case "badge":
            return (
                <ShimmerBar
                    width={column.barWidth ?? "4rem"}
                    height="h-5"
                    rounded="rounded-full"
                />
            );

        case "actions":
            return (
                <div
                    className={cn(
                        "flex items-center gap-1",
                        column.align === "right" && "justify-end",
                        column.align === "center" && "justify-center"
                    )}
                >
                    {Array.from({ length: column.actionCount ?? 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-8 w-8 animate-pulse rounded-md bg-zinc-200/80"
                        />
                    ))}
                </div>
            );

        case "text":
        default:
            return <ShimmerBar width={resolveWidth(column.barWidth ?? "80%")} />;
    }
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function TableSkeleton({
    columns,
    rows = 8,
    randomizeWidths = true,
}: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                    key={`skeleton-row-${rowIndex}`}
                    className="border-b border-[#f1f5fe]"
                    aria-hidden="true"
                >
                    {columns.map((column, colIndex) => (
                        <td
                            key={`skeleton-cell-${rowIndex}-${colIndex}`}
                            className={cn("px-3 py-2.5", column.className)}
                        >
                            <SkeletonCell
                                column={column}
                                seed={randomizeWidths ? rowIndex + colIndex : 0}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}