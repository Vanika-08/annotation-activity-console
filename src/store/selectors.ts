import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { tasksAdapterSelectors } from "./slices/tasksSlice";
import type { Task } from "@/types/task";

export const selectAllTasks = tasksAdapterSelectors.selectAll;
export const selectTaskById = tasksAdapterSelectors.selectById;
export const selectTasksTotal = tasksAdapterSelectors.selectTotal;

export const selectTasksStatus = (state: RootState) => state.tasks.status;
export const selectTasksError = (state: RootState) => state.tasks.error;
export const selectTasksWarnings = (state: RootState) => state.tasks.warnings;
export const selectCacheStatus = (state: RootState) => state.tasks.cacheStatus;
export const selectServerTotal = (state: RootState) => state.tasks.total;
export const selectServerPage = (state: RootState) => state.tasks.page;
export const selectServerPageSize = (state: RootState) => state.tasks.pageSize;
export const selectPendingIds = (state: RootState) => state.tasks.pendingIds;

export const selectUi = (state: RootState) => state.ui;

// Type/status/search filter, before sort and pagination.
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectUi],
  (tasks, ui): Task[] => {
    const search = ui.search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (ui.filterType !== "all" && t.type !== ui.filterType) return false;
      if (ui.filterStatus !== "all" && t.status !== ui.filterStatus) return false;
      if (search && !t.title.toLowerCase().includes(search)) return false;
      return true;
    });
  }
);

export const selectSortedTasks = createSelector(
  [selectFilteredTasks, selectUi],
  (tasks, ui): Task[] => {
    const dir = ui.sortDirection === "asc" ? 1 : -1;
    const field = ui.sortField;
    return [...tasks].sort((a, b) => (a[field] - b[field]) * dir);
  }
);

export const selectVisibleTotal = createSelector(
  [selectFilteredTasks],
  (tasks) => tasks.length
);

// Rows the table renders, after filter + sort + pagination.
export const selectPagedTasks = createSelector(
  [selectSortedTasks, selectUi],
  (tasks, ui): Task[] => {
    const start = (ui.currentPage - 1) * ui.pageSize;
    return tasks.slice(start, start + ui.pageSize);
  }
);

export const selectSelectedTask = createSelector(
  [(state: RootState) => state.tasks, selectUi],
  (tasksState, ui): Task | undefined =>
    ui.selectedTaskId ? tasksState.entities[ui.selectedTaskId] : undefined
);

// Whether more server pages remain, for the "load more" control.
export const selectHasMoreServerPages = createSelector(
  [selectTasksTotal, selectServerTotal],
  (loadedCount, serverTotal) => loadedCount < serverTotal
);

export const selectStatusCounts = createSelector(
  [selectAllTasks],
  (tasks) => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return counts;
  }
);
