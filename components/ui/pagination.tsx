import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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
    <div className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
      <label htmlFor="per-page-select" className="whitespace-nowrap select-none">
        {label}
      </label>
      <select
        id="per-page-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="
          rounded-md border border-slate-300 bg-white py-1.5 pl-2.5 pr-7
          text-sm text-slate-700 shadow-sm
          hover:border-slate-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          cursor-pointer transition-colors
        "
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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

  const baseBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
  const ghostBtn = `${baseBtn} text-slate-500 hover:bg-slate-100 hover:text-slate-700`;

  return (
    <nav
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
      aria-label="Pagination"
    >
      {showSummary && (
        <p className="text-sm text-slate-500 order-2 sm:order-1">
          Showing <span className="font-medium text-slate-700">{firstItemIndex}</span>–
          <span className="font-medium text-slate-700">{lastItemIndex}</span> of{" "}
          <span className="font-medium text-slate-700">{totalItems}</span> results
        </p>
      )}

      <ul className="flex items-center gap-1 order-1 sm:order-2">
        {showEdgeControls && (
          <li>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={safeCurrentPage === 1}
              className={ghostBtn}
              aria-label="Go to first page"
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
            className={ghostBtn}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </li>

        {paginationRange.map((page, idx) =>
          page === DOTS ? (
            <li key={`dots-${idx}`} className="px-1 text-sm text-slate-400 select-none">
              {DOTS}
            </li>
          ) : (
            <li key={page}>
              <button
                type="button"
                onClick={() => goTo(page)}
                aria-current={page === safeCurrentPage ? "page" : undefined}
                className={
                  page === safeCurrentPage
                    ? `${baseBtn} bg-indigo-600 text-white shadow-sm hover:bg-indigo-600`
                    : ghostBtn
                }
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
            className={ghostBtn}
            aria-label="Go to next page"
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
              className={ghostBtn}
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

