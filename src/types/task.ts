// Normalized domain model. Raw backend shapes live in raw.ts.

// Normalized status. Unrecognized values map to "unknown" (see normalize.ts).
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "qa"
  | "blocked"
  | "done"
  | "unknown";

export const TASK_STATUSES: readonly TaskStatus[] = [
  "todo",
  "in_progress",
  "qa",
  "blocked",
  "done",
  "unknown",
];

// Normalized task type. "unknown" covers types we don't model, e.g. "video".
export type TaskType = "image" | "audio" | "text" | "unknown";

export const TASK_TYPES: readonly TaskType[] = ["image", "audio", "text", "unknown"];

export interface User {
  id: string;
  name: string;
}

// Free-form metadata. priority/note are common; the index signature holds the rest.
export interface TaskMeta {
  priority?: string;
  note?: string;
  [key: string]: unknown;
}

interface BaseTask {
  id: string;
  title: string;
  status: TaskStatus;
  // Original status string, kept for debugging.
  rawStatus: string;
  assignee: User | null;
  annotationCount: number;
  // Epoch ms after normalization.
  updatedAt: number;
  meta: TaskMeta;
}

export interface ImageTask extends BaseTask {
  type: "image";
}
export interface AudioTask extends BaseTask {
  type: "audio";
}
export interface TextTask extends BaseTask {
  type: "text";
}
// A type we don't recognize; keeps the original type string in rawType.
export interface UnknownTypeTask extends BaseTask {
  type: "unknown";
  rawType: string;
}

export type Task = ImageTask | AudioTask | TextTask | UnknownTypeTask;

export interface TasksPage {
  page: number;
  pageSize: number;
  total: number;
  items: Task[];
}

// Non-fatal issue found while normalizing a task, surfaced in the UI.
export interface NormalizationWarning {
  taskId: string;
  field: string;
  message: string;
}
