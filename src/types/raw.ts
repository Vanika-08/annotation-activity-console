// Raw backend shapes. normalize.ts turns these into the domain model in task.ts.

export interface RawUser {
  id: string;
  name: string;
}

// REST payload for a single task.
export interface RawTask {
  id: string;
  title: string;
  // Usually a known type, but the server also sends "video" and possibly others.
  type: string;
  // Inconsistent casing/spelling, e.g. "in_progress", "InProgress", "QA", "BLOCKED".
  status: string;
  assignee: RawUser | null;
  // Number or numeric string.
  annotationCount: number | string;
  // Epoch ms or ISO string.
  updatedAt: number | string;
  // Free-form, may be empty.
  meta: Record<string, unknown>;
}

export interface RawTasksResponse {
  page: number;
  pageSize: number;
  total: number;
  items: RawTask[];
}

// WebSocket event envelopes, discriminated by `kind`. Validated before dispatch.
export interface RawTaskUpdatedEvent {
  kind: "task.updated";
  payload: {
    id: string;
    status: string;
    updatedAt: number;
  };
}

export interface RawTaskAssignedEvent {
  kind: "task.assigned";
  payload: {
    id: string;
    assignee: RawUser | null;
  };
}

export interface RawAnnotationCreatedEvent {
  kind: "annotation.created";
  payload: {
    taskId: string;
    by: string;
    at: number;
  };
}

export type RawSocketEvent =
  | RawTaskUpdatedEvent
  | RawTaskAssignedEvent
  | RawAnnotationCreatedEvent;
