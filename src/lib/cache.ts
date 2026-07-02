import localforage from "localforage";
import type { Task } from "@/types/task";

const CACHE_KEY = "tasks-cache-v1";

export interface TasksCacheEntry {
  items: Task[];
  page: number;
  pageSize: number;
  total: number;
  cachedAt: number;
}

let store: LocalForage | null = null;

function getStore(): LocalForage {
  if (typeof window === "undefined") {
    throw new Error("cache is only available in the browser");
  }
  if (!store) {
    store = localforage.createInstance({
      name: "annotation-console",
      storeName: "tasks_cache",
    });
  }
  return store;
}

// Read the cached task list. Returns null on any failure.
export async function readTasksCache(): Promise<TasksCacheEntry | null> {
  try {
    const entry = await getStore().getItem<TasksCacheEntry>(CACHE_KEY);
    return entry ?? null;
  } catch {
    return null;
  }
}

// Write the cache. Called fire-and-forget so it never blocks the UI.
export async function writeTasksCache(entry: TasksCacheEntry): Promise<void> {
  try {
    await getStore().setItem(CACHE_KEY, entry);
  } catch {
    // Ignore: IndexedDB may be unavailable (private browsing, quota).
  }
}

export async function clearTasksCache(): Promise<void> {
  try {
    await getStore().removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
