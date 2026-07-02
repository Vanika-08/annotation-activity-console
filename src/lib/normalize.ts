import type {
  RawTask,
  RawTasksResponse,
  RawUser,
  RawSocketEvent,
} from "@/types/raw";
import type {
  Task,
  TaskStatus,
  TaskType,
  TasksPage,
  User,
  NormalizationWarning,
  TaskMeta,
} from "@/types/task";

// Normalization rules:
// - Unknown status -> "unknown"; unknown type -> UnknownTypeTask with rawType.
// - annotationCount strings are parsed, falling back to 0.
// - updatedAt is normalized to epoch ms.
// - Rows without a valid id are dropped (nothing to key them by); the rest are kept.
// Warnings are collected rather than thrown so one bad row can't fail the batch.

const STATUS_MAP: Record<string, TaskStatus> = {
  todo: "todo",
  in_progress: "in_progress",
  inprogress: "in_progress",
  done: "done",
  qa: "qa",
  blocked: "blocked",
};

export function normalizeStatus(
  raw: string,
  taskId: string,
  warnings: NormalizationWarning[]
): TaskStatus {
  const key = raw.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const mapped = STATUS_MAP[key];
  if (mapped) return mapped;
  warnings.push({
    taskId,
    field: "status",
    message: `Unrecognized status "${raw}", coerced to "unknown"`,
  });
  return "unknown";
}

const KNOWN_TYPES = new Set<TaskType>(["image", "audio", "text"]);

function normalizeType(
  raw: string,
  taskId: string,
  warnings: NormalizationWarning[]
): TaskType {
  const key = raw.trim().toLowerCase();
  if (KNOWN_TYPES.has(key as TaskType)) return key as TaskType;
  warnings.push({
    taskId,
    field: "type",
    message: `Unrecognized type "${raw}", coerced to "unknown"`,
  });
  return "unknown";
}

function normalizeTimestamp(
  raw: number | string,
  taskId: string,
  field: string,
  warnings: NormalizationWarning[]
): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  warnings.push({
    taskId,
    field,
    message: `Unparseable timestamp "${String(raw)}", falling back to now()`,
  });
  return Date.now();
}

function normalizeCount(
  raw: number | string,
  taskId: string,
  warnings: NormalizationWarning[]
): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  const parsed = Number(raw);
  if (!Number.isNaN(parsed)) return parsed;
  warnings.push({
    taskId,
    field: "annotationCount",
    message: `Unparseable annotationCount "${String(raw)}", falling back to 0`,
  });
  return 0;
}

function normalizeUser(raw: RawUser | null): User | null {
  if (!raw) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  return { id: raw.id, name: raw.name };
}

function normalizeMeta(raw: unknown): TaskMeta {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as TaskMeta;
  }
  return {};
}

// Normalize one task. Returns null only when the id is missing/invalid.
export function normalizeTask(
  raw: RawTask,
  warnings: NormalizationWarning[]
): Task | null {
  if (!raw || typeof raw.id !== "string" || raw.id.length === 0) {
    warnings.push({
      taskId: typeof raw?.id === "string" ? raw.id : "<missing>",
      field: "id",
      message: "Task dropped: missing or invalid id",
    });
    return null;
  }

  const id = raw.id;
  const title =
    typeof raw.title === "string" && raw.title.length > 0
      ? raw.title
      : `Untitled (${id})`;
  const status = normalizeStatus(String(raw.status ?? ""), id, warnings);
  const type = normalizeType(String(raw.type ?? ""), id, warnings);
  const assignee = normalizeUser(raw.assignee);
  const annotationCount = normalizeCount(raw.annotationCount, id, warnings);
  const updatedAt = normalizeTimestamp(raw.updatedAt, id, "updatedAt", warnings);
  const meta = normalizeMeta(raw.meta);

  const base = {
    id,
    title,
    status,
    rawStatus: String(raw.status ?? ""),
    assignee,
    annotationCount,
    updatedAt,
    meta,
  };

  if (type === "unknown") {
    return { ...base, type: "unknown", rawType: String(raw.type ?? "") };
  }
  return { ...base, type };
}

export interface NormalizeResult<T> {
  data: T;
  warnings: NormalizationWarning[];
}

export function normalizeTasksResponse(
  raw: RawTasksResponse
): NormalizeResult<TasksPage> {
  const warnings: NormalizationWarning[] = [];
  const items: Task[] = [];
  for (const rawTask of raw.items ?? []) {
    const task = normalizeTask(rawTask, warnings);
    if (task) items.push(task);
  }
  return {
    data: {
      page: raw.page,
      pageSize: raw.pageSize,
      total: raw.total,
      items,
    },
    warnings,
  };
}

// Validate and narrow a socket message into a known event, or null.
export function parseSocketEvent(raw: unknown): RawSocketEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const kind = obj.kind;
  const payload = obj.payload;
  if (typeof kind !== "string" || !payload || typeof payload !== "object") {
    return null;
  }
  const p = payload as Record<string, unknown>;

  switch (kind) {
    case "task.updated":
      if (typeof p.id === "string" && typeof p.status === "string") {
        return {
          kind,
          payload: {
            id: p.id,
            status: p.status,
            updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : Date.now(),
          },
        };
      }
      return null;
    case "task.assigned":
      if (typeof p.id === "string") {
        return {
          kind,
          payload: {
            id: p.id,
            assignee: normalizeUser(p.assignee as RawUser | null) as
              | RawUser
              | null,
          },
        };
      }
      return null;
    case "annotation.created":
      if (typeof p.taskId === "string" && typeof p.by === "string") {
        return {
          kind,
          payload: {
            taskId: p.taskId,
            by: p.by,
            at: typeof p.at === "number" ? p.at : Date.now(),
          },
        };
      }
      return null;
    default:
      return null;
  }
}
