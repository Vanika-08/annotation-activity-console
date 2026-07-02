"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPagedTasks,
  selectVisibleTotal,
  selectTasksStatus,
  selectTasksError,
  selectHasMoreServerPages,
} from "@/store/selectors";
import { selectUi } from "@/store/selectors";
import { selectTask, setCurrentPage } from "@/store/slices/uiSlice";
import { loadTasksPage } from "@/store/slices/tasksSlice";
import type { Task } from "@/types/task";

function statusBadgeClasses(status: Task["status"]): string {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-blue-100 text-blue-800";
    case "qa":
      return "bg-purple-100 text-purple-800";
    case "blocked":
      return "bg-red-100 text-red-800";
    case "todo":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export function TaskTable() {
  const dispatch = useAppDispatch();
  const rows = useAppSelector(selectPagedTasks);
  const total = useAppSelector(selectVisibleTotal);
  const status = useAppSelector(selectTasksStatus);
  const error = useAppSelector(selectTasksError);
  const ui = useAppSelector(selectUi);
  const hasMoreServerPages = useAppSelector(selectHasMoreServerPages);
  const serverPage = useAppSelector((s) => s.tasks.page);
  const serverPageSize = useAppSelector((s) => s.tasks.pageSize);

  const totalClientPages = Math.max(1, Math.ceil(total / ui.pageSize));

  if (status === "loading" && rows.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500" role="status">
        Loading tasks…
      </div>
    );
  }

  if (status === "failed" && rows.length === 0) {
    return (
      <div className="p-6 text-sm text-red-600" role="alert">
        Failed to load tasks{error ? `: ${error}` : "."}
        <button
          type="button"
          className="ml-3 rounded border border-red-300 px-2 py-1 text-xs"
          onClick={() => dispatch(loadTasksPage({ page: 1, pageSize: serverPageSize }))}
        >
          Retry
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500" role="status">
        No tasks match your filters.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {status === "failed" && (
        <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          A background refresh failed{error ? `: ${error}` : ""}. Showing last known data.
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-gray-100 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Assignee</th>
              <th className="px-3 py-2">Annotations</th>
              <th className="px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                onClick={() => dispatch(selectTask(t.id))}
                className={`cursor-pointer border-b border-gray-100 hover:bg-blue-50 ${
                  ui.selectedTaskId === t.id ? "bg-blue-50" : ""
                }`}
              >
                <td className="px-3 py-2 font-medium">{t.title}</td>
                <td className="px-3 py-2 text-gray-600">{t.type}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusBadgeClasses(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {t.assignee ? t.assignee.name : <span className="italic text-gray-400">unassigned</span>}
                </td>
                <td className="px-3 py-2 text-gray-600">{t.annotationCount}</td>
                <td className="px-3 py-2 text-gray-500">
                  {new Date(t.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2 text-sm">
        <div className="text-gray-500">
          {total} matching task{total === 1 ? "" : "s"}
          {hasMoreServerPages && (
            <button
              type="button"
              className="ml-3 rounded border border-gray-300 px-2 py-1 text-xs disabled:opacity-50"
              disabled={status === "loading"}
              onClick={() =>
                dispatch(loadTasksPage({ page: serverPage + 1, pageSize: serverPageSize }))
              }
            >
              {status === "loading" ? "Loading…" : "Load more from server"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
            disabled={ui.currentPage <= 1}
            onClick={() => dispatch(setCurrentPage(ui.currentPage - 1))}
          >
            Prev
          </button>
          <span className="text-gray-500">
            Page {ui.currentPage} / {totalClientPages}
          </span>
          <button
            type="button"
            className="rounded border border-gray-300 px-2 py-1 disabled:opacity-50"
            disabled={ui.currentPage >= totalClientPages}
            onClick={() => dispatch(setCurrentPage(ui.currentPage + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
