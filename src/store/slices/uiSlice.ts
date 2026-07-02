import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskStatus, TaskType } from "@/types/task";

export type SortField = "updatedAt" | "annotationCount";
export type SortDirection = "asc" | "desc";

interface UiState {
  selectedTaskId: string | null;
  filterType: TaskType | "all";
  filterStatus: TaskStatus | "all";
  search: string;
  sortField: SortField;
  sortDirection: SortDirection;
  pageSize: number;
  currentPage: number;
}

const initialState: UiState = {
  selectedTaskId: null,
  filterType: "all",
  filterStatus: "all",
  search: "",
  sortField: "updatedAt",
  sortDirection: "desc",
  pageSize: 20,
  currentPage: 1,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    selectTask(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload;
    },
    setFilterType(state, action: PayloadAction<TaskType | "all">) {
      state.filterType = action.payload;
      state.currentPage = 1;
    },
    setFilterStatus(state, action: PayloadAction<TaskStatus | "all">) {
      state.filterStatus = action.payload;
      state.currentPage = 1;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.currentPage = 1;
    },
    setSort(
      state,
      action: PayloadAction<{ field: SortField; direction: SortDirection }>
    ) {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
  },
});

export const {
  selectTask,
  setFilterType,
  setFilterStatus,
  setSearch,
  setSort,
  setCurrentPage,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;
