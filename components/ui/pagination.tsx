import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items shown per page */
  itemsPerPage: number;
  /** Called with the new page number when the user navigates */
  onPageChange: (page: number) => void;
  /** How many page numbers to show on each side of the current page. Default: 1 */
  siblingCount?: number;
  /** Show "first page" / "last page" jump buttons. Default: true */
  showEdgeControls?: boolean;
  /** Show the "Showing X-Y of Z results" summary. Default: true */
  showSummary?: boolean;
  className?: string;
}

export interface PerPageOption {
  label: string;
  value: string | number;
}

export interface PerPageSelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  /** Options to offer. Default: [10, 25, 50, 100] */
  options?: (string | number)[];
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DOTS = "…" as const;

/**
 * Builds the array of page tokens to render, collapsing runs of pages
 * into a single ellipsis once they exceed the sibling window.
 * Example (current=5, total=10, siblingCount=1): [1, '…', 4, 5, 6, '…', 10]
 */
function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | typeof DOTS)[] {
  // +5 = first page + last page + current page + 2 dots
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + siblingCount * 2;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + siblingCount * 2;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i
  );
  return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
}

/* ------------------------------------------------------------------ */
/*  PerPageSelect                                                      */
/* ------------------------------------------------------------------ */

export function PerPageSelect({
  value,
  onChange,
  options = [10, 25, 50, 100],
  label = "Rows per page",
  className = "",
}: PerPageSelectProps) {
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground shrink-0", className)}>
      <label htmlFor="per-page-select" className="whitespace-nowrap select-none font-medium text-xs sm:text-sm">
        {label}
      </label>
      <div className="relative inline-flex items-center">
        <select
          id="per-page-select"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            h-9 sm:h-9 appearance-none rounded-lg border border-border
            bg-background pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-1
            text-xs sm:text-sm font-medium text-foreground shadow-2xs
            hover:border-foreground/30 hover:bg-muted/50
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background focus:border-primary
            cursor-pointer transition-colors touch-manipulation
          "
        >
          {options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-popover text-popover-foreground py-1"
            >
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 sm:right-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  siblingCount = 1,
  showEdgeControls = true,
  showSummary = true,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginationRange = useMemo(
    () => getPaginationRange(safeCurrentPage, totalPages, siblingCount),
    [safeCurrentPage, totalPages, siblingCount]
  );

  if (totalItems === 0) return null;

  const firstItemIndex = (safeCurrentPage - 1) * itemsPerPage + 1;
  const lastItemIndex = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    if (clamped !== safeCurrentPage) onPageChange(clamped);
  };

  const btnBase =
    "inline-flex h-8 min-w-8 sm:h-9 sm:min-w-9 items-center justify-center rounded-md px-1.5 sm:px-2 text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 select-none shadow-2xs";
  const defaultBtn = `${btnBase} border border-border/80 bg-background/70 hover:bg-muted text-foreground hover:text-foreground`;
  const activeBtn = `${btnBase} border border-primary bg-primary text-primary-foreground font-semibold shadow-xs hover:bg-primary/90`;
  const navBtn = `${btnBase} border border-border/80 bg-background/70 hover:bg-muted text-muted-foreground hover:text-foreground`;

  return (
    <nav
      className={cn("w-full flex-1", className)}
      aria-label="Pagination"
    >
      {/* Mobile App Navigation (< 640px) */}
      <div className="flex sm:hidden flex-col gap-2 w-full">
        {showSummary && (
          <p className="text-xs text-muted-foreground text-center">
            Showing <span className="font-semibold text-foreground">{firstItemIndex}</span>–
            <span className="font-semibold text-foreground">{lastItemIndex}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> results
          </p>
        )}
        <div className="flex items-center justify-between w-full gap-1.5">
          <div className="flex items-center gap-1">
            {showEdgeControls && (
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={safeCurrentPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/80 text-foreground shadow-2xs hover:bg-muted active:scale-[0.97] transition-all disabled:opacity-35 disabled:cursor-not-allowed touch-manipulation"
                aria-label="First page"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => goTo(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted active:scale-[0.97] transition-all disabled:opacity-35 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs font-semibold text-foreground shadow-2xs select-none">
            <span className="text-muted-foreground font-normal">Page</span>
            <span className="text-primary font-bold">{safeCurrentPage}</span>
            <span className="text-muted-foreground font-normal">/</span>
            <span>{totalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goTo(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-border/80 bg-background/80 px-2.5 text-xs font-semibold text-foreground shadow-2xs hover:bg-muted active:scale-[0.97] transition-all disabled:opacity-35 disabled:cursor-not-allowed touch-manipulation"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            {showEdgeControls && (
              <button
                type="button"
                onClick={() => goTo(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/80 text-foreground shadow-2xs hover:bg-muted active:scale-[0.97] transition-all disabled:opacity-35 disabled:cursor-not-allowed touch-manipulation"
                aria-label="Last page"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Navigation (>= 640px) */}
      <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
        {showSummary && (
          <p className="text-xs sm:text-sm text-muted-foreground text-left">
            Showing <span className="font-semibold text-foreground">{firstItemIndex}</span>–
            <span className="font-semibold text-foreground">{lastItemIndex}</span> of{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> results
          </p>
        )}

        <ul className="flex flex-wrap items-center justify-end gap-1.5">
          {showEdgeControls && (
            <li>
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={safeCurrentPage === 1}
                className={navBtn}
                aria-label="Go to first page"
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            </li>
          )}

          <li>
            <button
              type="button"
              onClick={() => goTo(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className={navBtn}
              aria-label="Go to previous page"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </li>

          {paginationRange.map((page, idx) =>
            page === DOTS ? (
              <li key={`dots-${idx}`} className="px-1.5 text-xs sm:text-sm font-medium text-muted-foreground/60 select-none">
                {DOTS}
              </li>
            ) : (
              <li key={page}>
                <button
                  type="button"
                  onClick={() => goTo(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                  className={page === safeCurrentPage ? activeBtn : defaultBtn}
                >
                  {page}
                </button>
              </li>
            )
          )}

          <li>
            <button
              type="button"
              onClick={() => goTo(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className={navBtn}
              aria-label="Go to next page"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>

          {showEdgeControls && (
            <li>
              <button
                type="button"
                onClick={() => goTo(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className={navBtn}
                aria-label="Go to last page"
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

