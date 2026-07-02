import type { RawTask, RawTasksResponse } from "@/types/raw";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

export interface FetchTasksParams {
  page: number;
  pageSize: number;
  type?: string;
  status?: string;
}

export async function fetchTasksPage(
  params: FetchTasksParams,
  signal?: AbortSignal
): Promise<RawTasksResponse> {
  const qs = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.type) qs.set("type", params.type);
  if (params.status) qs.set("status", params.status);

  const res = await fetch(`${API_BASE}/api/tasks?${qs.toString()}`, {
    signal,
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchTaskById(
  id: string,
  signal?: AbortSignal
): Promise<RawTask | null> {
  const res = await fetch(`${API_BASE}/api/tasks/${encodeURIComponent(id)}`, {
    signal,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to fetch task ${id}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export function getApiBase(): string {
  return API_BASE;
}
