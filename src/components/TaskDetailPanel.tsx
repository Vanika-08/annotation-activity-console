"use client";

import { useAppSelector } from "@/store/hooks";
import { selectSelectedTask } from "@/store/selectors";
import { SummaryMarkdown } from "./SummaryMarkdown";

export function TaskDetailPanel() {
  const task = useAppSelector(selectSelectedTask);

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-gray-400">
        Select a task to see details.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <h2 className="text-lg font-semibold">{task.title}</h2>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
        <dt className="font-medium text-gray-500">ID</dt>
        <dd>{task.id}</dd>
        <dt className="font-medium text-gray-500">Type</dt>
        <dd>
          {task.type}
          {task.type === "unknown" && (
            <span className="ml-1 text-xs text-gray-400">(raw: {task.rawType})</span>
          )}
        </dd>
        <dt className="font-medium text-gray-500">Status</dt>
        <dd>
          {task.status}
          {task.status === "unknown" && (
            <span className="ml-1 text-xs text-gray-400">(raw: {task.rawStatus})</span>
          )}
        </dd>
        <dt className="font-medium text-gray-500">Assignee</dt>
        <dd>{task.assignee ? task.assignee.name : "Unassigned"}</dd>
        <dt className="font-medium text-gray-500">Annotations</dt>
        <dd>{task.annotationCount}</dd>
        <dt className="font-medium text-gray-500">Updated</dt>
        <dd>{new Date(task.updatedAt).toLocaleString()}</dd>
        {task.meta.priority && (
          <>
            <dt className="font-medium text-gray-500">Priority</dt>
            <dd>{task.meta.priority}</dd>
          </>
        )}
        {task.meta.note && (
          <>
            <dt className="font-medium text-gray-500">Note</dt>
            <dd>{task.meta.note}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">AI Summary</h3>
        <SummaryMarkdown taskId={task.id} />
      </div>
    </div>
  );
}
