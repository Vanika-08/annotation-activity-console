import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Task, NormalizationWarning } from "@/types/task";
import { normalizeTasksResponse, normalizeTask, normalizeStatus } from "@/lib/normalize";
import { fetchTasksPage, fetchTaskById } from "@/lib/api";
import type { RootState } from "@/store";

const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: false, // ordering handled by selectors
});

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
// Cache freshness shown in the status bar.
export type CacheStatus = "none" | "cached" | "fresh" | "revalidating";

interface TasksState {
  status: LoadStatus;
  error: string | null;
  warnings: NormalizationWarning[];
  page: number;
  pageSize: number;
  total: number;
  cacheStatus: CacheStatus;
  lastFetchedAt: number | null;
  // ids referenced by socket events but not yet loaded, and ids being fetched.
  pendingIds: string[];
  fetchingIds: string[];
}

const initialState = tasksAdapter.getInitialState<TasksState>({
  status: "idle",
  error: null,
  warnings: [],
  page: 1,
  pageSize: 20,
  total: 0,
  cacheStatus: "none",
  lastFetchedAt: null,
  pendingIds: [],
  fetchingIds: [],
});

export const loadTasksPage = createAsyncThunk<
  { page: number; pageSize: number; total: number; items: Task[]; warnings: NormalizationWarning[] },
  { page: number; pageSize: number },
  { state: RootState }
>("tasks/loadPage", async ({ page, pageSize }, { signal }) => {
  const raw = await fetchTasksPage({ page, pageSize }, signal);
  const { data, warnings } = normalizeTasksResponse(raw);
  return { ...data, warnings };
});

// Fetch a task referenced by a socket event that isn't in the store yet.
export const loadMissingTask = createAsyncThunk<
  Task | null,
  string,
  { state: RootState }
>("tasks/loadMissing", async (id, { getState }) => {
  const state = getState();
  if (tasksAdapter.getSelectors().selectById(state.tasks, id)) return null;
  const raw = await fetchTaskById(id);
  if (!raw) return null;
  const warnings: NormalizationWarning[] = [];
  const task = normalizeTask(raw, warnings);
  return task;
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Seed from cache on startup, marked "cached" until a real fetch lands.
    hydrateFromCache(
      state,
      action: PayloadAction<{ items: Task[]; page: number; pageSize: number; total: number }>
    ) {
      tasksAdapter.setAll(state, action.payload.items);
      state.page = action.payload.page;
      state.pageSize = action.payload.pageSize;
      state.total = action.payload.total;
      state.cacheStatus = "cached";
    },
    taskUpdated(
      state,
      action: PayloadAction<{ id: string; status: string; updatedAt: number }>
    ) {
      const existing = state.entities[action.payload.id];
      if (!existing) {
        if (!state.pendingIds.includes(action.payload.id)) {
          state.pendingIds.push(action.payload.id);
        }
        return;
      }
      const warnings: NormalizationWarning[] = [];
      const normalizedStatus = normalizeStatus(
        action.payload.status,
        action.payload.id,
        warnings
      );
      tasksAdapter.updateOne(state, {
        id: action.payload.id,
        changes: {
          status: normalizedStatus,
          rawStatus: action.payload.status,
          updatedAt: action.payload.updatedAt,
        },
      });
      state.warnings.push(...warnings);
    },
    taskAssigned(
      state,
      action: PayloadAction<{ id: string; assignee: { id: string; name: string } | null }>
    ) {
      const existing = state.entities[action.payload.id];
      if (!existing) {
        if (!state.pendingIds.includes(action.payload.id)) {
          state.pendingIds.push(action.payload.id);
        }
        return;
      }
      tasksAdapter.updateOne(state, {
        id: action.payload.id,
        changes: { assignee: action.payload.assignee },
      });
    },
    annotationCreated(
      state,
      action: PayloadAction<{ taskId: string; by: string; at: number }>
    ) {
      const existing = state.entities[action.payload.taskId];
      if (!existing) {
        if (!state.pendingIds.includes(action.payload.taskId)) {
          state.pendingIds.push(action.payload.taskId);
        }
        return;
      }
      tasksAdapter.updateOne(state, {
        id: action.payload.taskId,
        changes: {
          annotationCount: existing.annotationCount + 1,
          updatedAt: action.payload.at,
        },
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasksPage.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.cacheStatus = state.cacheStatus === "cached" ? "revalidating" : state.cacheStatus;
      })
      .addCase(loadTasksPage.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Mock server only paginates, so accumulate pages and filter client-side.
        tasksAdapter.upsertMany(state, action.payload.items);
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
        state.warnings = action.payload.warnings;
        state.cacheStatus = "fresh";
        state.lastFetchedAt = Date.now();
      })
      .addCase(loadTasksPage.rejected, (state, action) => {
        if (action.meta.aborted) return;
        state.status = "failed";
        state.error = action.error.message ?? "Failed to load tasks";
        // keep existing data on failure
      })
      .addCase(loadMissingTask.pending, (state, action) => {
        const id = action.meta.arg;
        if (!state.fetchingIds.includes(id)) state.fetchingIds.push(id);
      })
      .addCase(loadMissingTask.fulfilled, (state, action) => {
        const id = action.meta.arg;
        state.fetchingIds = state.fetchingIds.filter((x) => x !== id);
        state.pendingIds = state.pendingIds.filter((x) => x !== id);
        if (action.payload) {
          tasksAdapter.upsertOne(state, action.payload);
        }
      })
      .addCase(loadMissingTask.rejected, (state, action) => {
        const id = action.meta.arg;
        state.fetchingIds = state.fetchingIds.filter((x) => x !== id);
        // leave in pendingIds; a later event for the same id retries
      });
  },
});

export const { hydrateFromCache, taskUpdated, taskAssigned, annotationCreated } =
  tasksSlice.actions;

export const tasksReducer = tasksSlice.reducer;

export const tasksAdapterSelectors = tasksAdapter.getSelectors<RootState>(
  (state) => state.tasks
);
