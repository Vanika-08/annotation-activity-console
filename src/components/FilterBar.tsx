"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUi } from "@/store/selectors";
import { setFilterType, setFilterStatus, setSearch, setSort } from "@/store/slices/uiSlice";
import { TASK_STATUSES, TASK_TYPES } from "@/types/task";
import type { SortField } from "@/store/slices/uiSlice";

export function FilterBar() {
  const dispatch = useAppDispatch();
  const ui = useAppSelector(selectUi);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white p-3">
      <input
        type="text"
        placeholder="Search title…"
        value={ui.search}
        onChange={(e) => dispatch(setSearch(e.target.value))}
        className="w-56 rounded border border-gray-300 px-2 py-1 text-sm"
        aria-label="Search tasks by title"
      />

      <label className="flex items-center gap-1 text-sm">
        Type
        <select
          value={ui.filterType}
          onChange={(e) => dispatch(setFilterType(e.target.value as typeof ui.filterType))}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1 text-sm">
        Status
        <select
          value={ui.filterStatus}
          onChange={(e) => dispatch(setFilterStatus(e.target.value as typeof ui.filterStatus))}
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="all">All</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-1 text-sm">
        Sort by
        <select
          value={ui.sortField}
          onChange={(e) =>
            dispatch(
              setSort({ field: e.target.value as SortField, direction: ui.sortDirection })
            )
          }
          className="rounded border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="updatedAt">Updated</option>
          <option value="annotationCount">Annotation count</option>
        </select>
        <button
          type="button"
          onClick={() =>
            dispatch(
              setSort({
                field: ui.sortField,
                direction: ui.sortDirection === "asc" ? "desc" : "asc",
              })
            )
          }
          className="rounded border border-gray-300 px-2 py-1 text-sm"
          aria-label="Toggle sort direction"
        >
          {ui.sortDirection === "asc" ? "↑" : "↓"}
        </button>
      </label>
    </div>
  );
}
