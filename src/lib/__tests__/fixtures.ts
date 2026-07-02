import type { RawTask } from "@/types/raw";
import type { Task } from "@/types/task";

export function rawTask(overrides: Partial<RawTask> = {}): RawTask {
  return {
    id: "t1",
    title: "Sample task",
    type: "image",
    status: "todo",
    assignee: { id: "u1", name: "Asha" },
    annotationCount: 3,
    updatedAt: 1719600000000,
    meta: {},
    ...overrides,
  };
}

export function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Sample task",
    type: "image",
    status: "todo",
    rawStatus: "todo",
    assignee: { id: "u1", name: "Asha" },
    annotationCount: 3,
    updatedAt: 1719600000000,
    meta: {},
    ...overrides,
  } as Task;
}
