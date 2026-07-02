"use client";

import { useBootstrapTasks } from "@/hooks/useBootstrapTasks";
import { useTaskFeed } from "@/hooks/useTaskFeed";
import { FilterBar } from "./FilterBar";
import { TaskTable } from "./TaskTable";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { StatusBar } from "./StatusBar";

export function Console() {
  useBootstrapTasks();
  const feedStatus = useTaskFeed();

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-xl font-semibold">Annotation Activity Console</h1>
      </header>
      <StatusBar feedStatus={feedStatus} />
      <FilterBar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden border-r border-gray-200">
          <TaskTable />
        </div>
        <div className="w-[420px] shrink-0 overflow-hidden bg-white">
          <TaskDetailPanel />
        </div>
      </div>
    </div>
  );
}
